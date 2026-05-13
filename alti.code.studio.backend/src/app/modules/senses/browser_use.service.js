/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Deep Integration: browser-use/browser-use
 * This service creates a Node.js-to-Python bridge to natively instantiate 
 * the powerful `browser-use` AI Agent framework.
 */

import { logger } from '../../../shared/logger.js';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export class BrowserUseService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || process.env.ALTI_API_KEY; // Requires Gemini 2.0 Flash ideally
    }

    /**
     * Executes a complex browser task via `browser-use` Python library.
     * @param {string} taskInstruction - Natural language objective (e.g. "Find the latest AI news on Hacker News")
     * @param {boolean} headless - Run Playwright in headless mode
     * @returns {Promise<string>} The final synthesized result from the Agent's history
     */
    async executeBrowserTask(taskInstruction, headless = true) {
        if (!this.apiKey) {
            throw new Error('BrowserUse: GEMINI_API_KEY or ALTI_API_KEY is missing from environment.');
        }

        logger.info(`🌐 BrowserUse: Booting Python Bridge for task [${taskInstruction.substring(0, 50)}...]`);

        // Generate a transient Python script to define and run the agent.
        // We use google-genai because it performs exceptionally well with browser-use
        const pythonScriptContent = `
import asyncio
import sys
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent, Browser, BrowserConfig

async def main():
    try:
        # Initialize the Gemini 2.0 model
        llm = ChatGoogleGenerativeAI(
            model='gemini-3.1-flash',
            api_key='${this.apiKey}'
        )
        
        # Configure the browser
        browser = Browser(
            config=BrowserConfig(
                headless=${headless ? 'True' : 'False'},
                disable_security=True
            )
        )
        
        # Define and run the agent
        agent = Agent(
            task="${taskInstruction.replace(/"/g, '\\"')}",
            llm=llm,
            browser=browser
        )
        
        history = await agent.run()
        
        # The agent's history is an ActionResult. We'll grab the final extracted content or text
        final_result = history.final_result()
        if final_result:
             print(json.dumps({"status": "success", "result": final_result}))
        else:
             print(json.dumps({"status": "success", "result": "Task finished but no distinct final result was isolated. Check browser end state."}))
             
        await browser.close()
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
`;

        const scriptPath = path.join(os.tmpdir(), `browser_use_task_${Date.now()}.py`);

        try {
            await writeFileAsync(scriptPath, pythonScriptContent, 'utf-8');

            return await new Promise((resolve, reject) => {
                const pyProc = spawn('python', [scriptPath], {
                    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
                });

                let stdoutData = '';
                let stderrData = '';

                pyProc.stdout.on('data', (data) => {
                    stdoutData += data.toString();
                });

                pyProc.stderr.on('data', (data) => {
                    // browser-use spits a lot of INFO/DEBUG logs to stderr via langchain
                    stderrData += data.toString();
                });

                pyProc.on('close', (code) => {
                    // Try to parse the last JSON object printed by our script
                    try {
                        // Extract just the JSON part from stdout (which might have other python noise)
                        const lines = stdoutData.trim().split('\\n');
                        let resultJson = null;

                        for (let i = lines.length - 1; i >= 0; i--) {
                            if (lines[i].startsWith('{') && lines[i].endsWith('}')) {
                                resultJson = JSON.parse(lines[i]);
                                break;
                            }
                        }

                        if (resultJson && resultJson.status === 'success') {
                            logger.info(`✅ BrowserUse: Task completed successfully.`);
                            // Optionally debug log: logger.debug(stderrData)
                            resolve(resultJson.result);
                        } else if (resultJson && resultJson.status === 'error') {
                            reject(new Error(`BrowserUse Python Error: ${resultJson.message}`));
                        } else {
                            if (code !== 0) {
                                reject(new Error(`Python script exited with code ${code}. \nSTDERR: ${stderrData}`));
                            } else {
                                resolve("Task completed without standard JSON output. " + stdoutData);
                            }
                        }

                    } catch (err) {
                        logger.error(`Failed to parse BrowserUse output: ${err.message}`);
                        logger.debug(`Raw STDOUT: ${stdoutData}`);
                        logger.debug(`Raw STDERR: ${stderrData}`);
                        reject(new Error('Failed to parse Python bridge output.'));
                    }
                });
            });

        } catch (error) {
            logger.error(`❌ BrowserUse Service Error: ${error.message}`);
            throw error;
        } finally {
            // Cleanup transient script
            if (fs.existsSync(scriptPath)) {
                await unlinkAsync(scriptPath).catch(e => console.error("Failed to delete temp python script", e));
            }
        }
    }
}

export const browserUseService = new BrowserUseService();
