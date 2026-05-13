/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const execAsync = util.promisify(exec);

class AutonomicSurgeon {

    async runLoop(command, cwd = process.cwd(), maxRetries = 3) {
        logger.info(`🔄 Autonomic Loop: Starting '${command}' (Max Retries: ${maxRetries})`);

        let attempts = 0;
        let lastError = null;

        while (attempts < maxRetries) {
            attempts++;
            logger.info(`▶️ Attempt ${attempts}/${maxRetries}`);

            try {
                const { stdout, stderr } = await execAsync(command, { cwd });
                logger.info(`✅ Command Succeeded!`);
                return {
                    status: 'success',
                    attempts,
                    output: stdout
                };
            } catch (error) {
                lastError = error;
                const errorOutput = error.stderr || error.stdout || error.message;
                logger.warn(`❌ Attempt ${attempts} Failed: ${errorOutput.substring(0, 200)}...`);

                if (attempts >= maxRetries) break;

                // AI Diagnosis & Fix
                logger.info(`🧠 Analyzing error and attempting fix...`);
                await this._attemptFix(command, errorOutput, cwd);
            }
        }

        return {
            status: 'failed',
            attempts,
            error: lastError ? lastError.message : "Unknown error"
        };
    }

    async _attemptFix(command, errorLog, cwd) {
        // 1. Identify likely file from error log (naive regex)
        // Look for file paths like src/foo.js:10:2 or similar
        const fileMatch = errorLog.match(/([a-zA-Z0-9_\-\/]+\.(js|ts|jsx|tsx)):(\d+)/);

        let fileContext = "";
        let targetFile = null;

        if (fileMatch) {
            targetFile = path.resolve(cwd, fileMatch[1]);
            try {
                const content = await fs.readFile(targetFile, 'utf-8');
                fileContext = `
                Target File: ${fileMatch[1]}
                Content:
                ${content}
                `;
            } catch (e) {
                logger.warn(`Could not read file from error log: ${targetFile}`);
            }
        }

        // 2. Ask Gemini for a fix
        const prompt = `
        You are an Autonomous Repair Agent.
        Command failed: "${command}"
        
        Error Log:
        ${errorLog.substring(0, 2000)}

        ${fileContext}

        Task:
        1. Analyze the error.
        2. If you see the code, provide a replacement block to fix it.
        3. If you don't see code, suggest a shell command to fix environment (e.g., npm install).

        Output JSON:
        {
            "action": "edit_file" | "run_command",
            "file": "path/to/file",
            "search": "exact code to replace",
            "replace": "new code",
            "command": "shell command to run"
        }
        `;

        const resultStr = await GeminiAiService.generateContent(prompt);
        let plan;
        try {
            // Clean markdown
            const jsonStr = resultStr.replace(/^```json|```$/g, '').trim();
            plan = JSON.parse(jsonStr);
        } catch (e) {
            logger.warn('Failed to parse AI fix plan', e);
            return;
        }

        // 3. Apply Fix
        if (plan.action === 'edit_file' && plan.file && plan.search && plan.replace) {
            try {
                const absPath = path.resolve(cwd, plan.file);
                let content = await fs.readFile(absPath, 'utf-8');
                if (content.includes(plan.search)) {
                    content = content.replace(plan.search, plan.replace);
                    await fs.writeFile(absPath, content);
                    logger.info(`🩹 Applied fix to ${plan.file}`);
                } else {
                    logger.warn(`Could not find search string in ${plan.file}`);
                }
            } catch (e) {
                logger.error('Failed to apply file edit', e);
            }
        } else if (plan.action === 'run_command' && plan.command) {
            try {
                await execAsync(plan.command, { cwd });
                logger.info(`🛠️ Ran fix command: ${plan.command}`);
            } catch (e) {
                logger.error('Failed to run fix command', e);
            }
        }
    }
}

export const autonomicSurgeon = new AutonomicSurgeon();
