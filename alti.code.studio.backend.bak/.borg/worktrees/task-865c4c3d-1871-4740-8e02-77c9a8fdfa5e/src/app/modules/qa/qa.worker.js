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
import { vectorStoreService } from '../memory/vector.store.js';

const execAsync = util.promisify(exec);

export const qaWorkerProcessor = async (job) => {
    const { filePath, userId } = job.data;
    const jobId = job.id;
    const testFile = filePath.replace('.js', '.test.js');

    logger.info(`🧪 QAWorker [${jobId}]: Generating tests for ${path.basename(filePath)}...`);

    try {
        // 1. GENERATE TEST
        const sourceCode = await fs.readFile(filePath, 'utf-8');
        const prompt = `
        Write a comprehensive Vitest unit test for:
        \`\`\`javascript
        ${sourceCode}
        \`\`\`
        Requirements:
        - Use import { describe, it, expect, vi } from 'vitest';
        - Mock dependencies.
        - Return ONLY code.
        `;

        const aiResponse = await GeminiAiService.generateContent(prompt);
        let testCode = aiResponse.replace(/^```javascript\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');

        await fs.writeFile(testFile, testCode);

        // 2. EXECUTE TEST
        logger.info(`🧪 QAWorker [${jobId}]: Running Vitest...`);
        try {
            await execAsync(`npx vitest run ${testFile}`, { cwd: process.cwd() });
            logger.info(`✅ QAWorker [${jobId}]: Tests Passed!`);

            // Memorize Success
            await vectorStoreService.add(`Test Suite for ${path.basename(filePath)}`, { type: 'qa-test', passed: true });

        } catch (testError) {
            logger.warn(`⚠️ QAWorker [${jobId}]: Tests Failed! Initiating Self-Repair...`);

            // 3. SELF-HEAL (Retry Once)
            const repairPrompt = `
            The following test failed:
            ${testError.stdout || testError.message}
            
            Source Code:
            ${sourceCode}
            
            Current Test Code:
            ${testCode}
            
            Fix the test code. Return ONLY valid javascript.
            `;

            const repairResponse = await GeminiAiService.generateContent(repairPrompt);
            testCode = repairResponse.replace(/^```javascript\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');

            await fs.writeFile(testFile, testCode);

            logger.info(`🧪 QAWorker [${jobId}]: Re-running Fixed Tests...`);
            await execAsync(`npx vitest run ${testFile}`, { cwd: process.cwd() });
            logger.info(`✅ QAWorker [${jobId}]: Self-Healing Successful!`);
        }

        return { status: 'passed', testFile };

    } catch (error) {
        logger.error(`❌ QAWorker [${jobId}] Failed`, error);
        throw error;
    }
};
