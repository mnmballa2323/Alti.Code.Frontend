/**
 * Copyright (c) 2024 Inso Code
 * 
 * Deep Integration: simular-ai/Agent-S
 * This service creates a Node.js-to-Python bridge to natively instantiate 
 * the powerful `gui-agents` (Agent S3) AI framework for autonomous Physical GUI control.
 */

import { logger } from '../../../shared/logger.js';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import config from '../../../../config/index.js';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export class AgentSService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || process.env.ALTI_API_KEY; // Requires Gemini 2.0 Flash or OpenAI ideally
        this.pythonPath = config.agent_s_python_path || 'python';
        this.activeSubprocesses = new Map();
    }

    /**
     * Executes a physical GUI task via the Simular AI `gui-agents` Python SDK.
     * @param {string} taskInstruction - Natural language objective (e.g. "Close VS Code", "Open calculator and type 5 + 5")
     * @returns {Promise<string>} The output of the action execution
     */
    async executeGUITask(taskInstruction, options = {}) {
        if (!this.apiKey) {
            throw new Error('Agent S: GEMINI_API_KEY or ALTI_API_KEY is missing from environment.');
        }

        const taskId = options.taskId || options.task_id || `task_${Date.now()}`;
        const logsDir = path.resolve(process.cwd(), 'logs', 'agent_s', 'tasks', taskId);
        const logsDirEscaped = logsDir.replace(/\\/g, '/');

        logger.info(`🖥️ Agent S (GUI Operator): Booting Python Bridge for task [${taskId}] [${taskInstruction.substring(0, 50)}...]`);

        // Generate a transient Python script to define and run the Agent S3 instance.
        const pythonScriptContent = `
import asyncio
import sys
import json
import traceback
import os
try:
    import pyautogui
    import io
    from gui_agents.s3.agents.agent_s import AgentS3
    from gui_agents.s3.agents.grounding import OSWorldACI
    from gui_agents.s3.utils.local_env import LocalEnv
except ImportError as e:
    print(json.dumps({"status": "error", "message": f"Missing dependencies: {str(e)}"}))
    sys.exit(1)

os.environ["GEMINI_API_KEY"] = "${this.apiKey}"

async def main():
    try:
        # Detect platform
        current_platform = "windows"
        if sys.platform === "darwin":
            current_platform = "darwin"
        elif sys.platform.startswith("linux"):
            current_platform = "linux"

        # Define engine params
        engine_params = {
            "engine_type": "gemini",
            "model": "gemini-3.1-flash",
            "api_key": "${this.apiKey}"
        }

        engine_params_for_grounding = {
            "engine_type": "gemini",
            "model": "gemini-3.1-flash", 
            "api_key": "${this.apiKey}",
            "grounding_width": 1920,
            "grounding_height": 1080,
        }

        enable_local_env = False
        local_env = LocalEnv() if enable_local_env else None

        grounding_agent = OSWorldACI(
            env=local_env,
            platform=current_platform,
            engine_params_for_generation=engine_params,
            engine_params_for_grounding=engine_params_for_grounding,
            width=1920,
            height=1080
        )

        agent = AgentS3(
            engine_params,
            grounding_agent,
            platform=current_platform,
            max_trajectory_length=8,
            enable_reflection=True
        )
        
        # Run Prediction Loop
        instruction = "${taskInstruction.replace(/"/g, '\\"')}"
        dry_run = ${options.dryRun !== false ? 'True' : 'False'}
        max_steps = ${options.maxSteps || 8}
        logs_dir = "${logsDirEscaped}"
        os.makedirs(logs_dir, exist_ok=True)
        
        trajectory = []
        
        for step in range(max_steps):
            # Take a screenshot
            screenshot = pyautogui.screenshot()
            screenshot_path = os.path.join(logs_dir, f"step_{step + 1}.png")
            screenshot.save(screenshot_path, format="PNG")
            
            buffered = io.BytesIO() 
            screenshot.save(buffered, format="PNG")
            screenshot_bytes = buffered.getvalue()

            obs = {
              "screenshot": screenshot_bytes,
            }
            
            # Predict next action
            info, action = agent.predict(instruction=instruction, observation=obs)
            
            action_str = action[0] if action and len(action) > 0 else None
            if not action_str:
                break
                
            trajectory.append({
                "step": step + 1,
                "action": action_str,
                "executed": not dry_run,
                "screenshot": f"/logs/agent_s/tasks/${taskId}/step_{step + 1}.png"
            })

            if "stop" in action_str.lower() or "finish" in action_str.lower():
                break

            if not dry_run:
                try:
                    exec(action_str)
                    await asyncio.sleep(1.0)
                except Exception as exec_err:
                    print(json.dumps({
                        "status": "error",
                        "message": f"Execution failed at step {step + 1}: {str(exec_err)}",
                        "trajectory": trajectory
                    }))
                    sys.exit(1)
            else:
                break

        print(json.dumps({
            "status": "success", 
            "result": f"Agent S executed {len(trajectory)} steps. Dry Run: {dry_run}",
            "trajectory": trajectory
        }))

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e), "trace": traceback.format_exc()}))
        sys.exit(1)

if __name__ === '__main__':
    asyncio.run(main())
`;

        const scriptPath = path.join(os.tmpdir(), `agent_s_task_${Date.now()}.py`);

        try {
            await writeFileAsync(scriptPath, pythonScriptContent, 'utf-8');

            return await new Promise((resolve, reject) => {
                const pyProc = spawn(this.pythonPath, [scriptPath], {
                    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
                });

                this.activeSubprocesses.set(taskId, pyProc);

                let stdoutData = '';
                let stderrData = '';

                pyProc.stdout.on('data', (data) => {
                    stdoutData += data.toString();
                });

                pyProc.stderr.on('data', (data) => {
                    stderrData += data.toString();
                });

                pyProc.on('close', (code) => {
                    this.activeSubprocesses.delete(taskId);
                    try {
                        const lines = stdoutData.trim().split('\n');
                        let resultJson = null;

                        for (let i = lines.length - 1; i >= 0; i--) {
                            if (lines[i].startsWith('{') && lines[i].endsWith('}')) {
                                resultJson = JSON.parse(lines[i]);
                                break;
                            }
                        }

                        if (resultJson && resultJson.status === 'success') {
                            logger.info(`✅ Agent S: Task inference completed successfully.`);
                            resolve({
                                result: resultJson.result,
                                trajectory: resultJson.trajectory || []
                            });
                        } else if (resultJson && resultJson.status === 'error') {
                            reject(new Error(`Agent S Python Error: ${resultJson.message}\n${resultJson.trace}`));
                        } else {
                            if (code !== 0) {
                                reject(new Error(`Python script exited with code ${code}. \nSTDERR: ${stderrData}`));
                            } else {
                                resolve({
                                    result: "Task completed without standard JSON output. " + stdoutData,
                                    trajectory: []
                                });
                            }
                        }

                    } catch (err) {
                        logger.error(`Failed to parse Agent S output: ${err.message}`);
                        logger.debug(`Raw STDOUT: ${stdoutData}`);
                        logger.debug(`Raw STDERR: ${stderrData}`);
                        reject(new Error('Failed to parse Python bridge output.'));
                    }
                });
            });

        } catch (error) {
            logger.error(`❌ Agent S Service Error: ${error.message}`);
            throw error;
        } finally {
            if (fs.existsSync(scriptPath)) {
                await unlinkAsync(scriptPath).catch(e => logger.error("Failed to delete temp python script", e));
            }
        }
    }

    /**
     * Cancels an active GUI task execution process.
     * @param {string} taskId - The ID of the task to cancel.
     */
    async cancelGUITask(taskId) {
        const proc = this.activeSubprocesses.get(taskId);
        if (proc) {
            proc.kill('SIGINT');
            this.activeSubprocesses.delete(taskId);
            return { success: true, message: `GUI task ${taskId} cancelled.` };
        }
        return { success: false, message: `No active GUI task found with ID ${taskId}.` };
    }

    /**
     * Runs python dependency checks and environment diagnostics.
     */
    async checkSystemDiagnostics() {
        return new Promise((resolve) => {
            const pyProc = spawn(this.pythonPath, [
                '-c',
                "import sys, os, json, ctypes; dependencies = ['pyautogui', 'gui_agents', 'paddleocr', 'cv2']; missing = [];\nfor d in dependencies:\n    try: __import__(d)\n    except ImportError: missing.append(d)\nis_trusted = True\nif sys.platform === 'darwin':\n    try:\n        app_services = ctypes.CDLL('/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices')\n        is_trusted = bool(app_services.AXIsProcessTrusted())\n    except Exception:\n        is_trusted = False\nprint(json.dumps({'platform': sys.platform, 'python': sys.version, 'missing': missing, 'accessibility_trusted': is_trusted}))"
            ]);
            let stdout = '';
            pyProc.stdout.on('data', d => stdout += d.toString());
            pyProc.on('close', () => {
                try {
                    const parsed = JSON.parse(stdout.trim());
                    const ok = parsed.missing.length === 0;
                    const accessibilityTrusted = parsed.accessibility_trusted !== undefined ? parsed.accessibility_trusted : true;
                    resolve({
                        ok: ok && accessibilityTrusted,
                        platform: parsed.platform,
                        python: parsed.python,
                        missingDependencies: parsed.missing,
                        accessibilityPermissions: parsed.platform === 'darwin'
                            ? (accessibilityTrusted ? 'Granted' : 'Denied - Please enable in macOS System Settings -> Privacy & Security -> Accessibility')
                            : 'OK'
                    });
                } catch (err) {
                    resolve({
                        ok: false,
                        error: `Failed to run python diagnostics: ${stdout || err.message}`
                    });
                }
            });
        });
    }
}

export const agentSService = new AgentSService();
