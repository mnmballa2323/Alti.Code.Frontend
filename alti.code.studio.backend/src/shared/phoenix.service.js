/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import { astService } from './ast.service.js';
import fs from 'fs/promises';

export class PhoenixService {
    constructor() {
        this.isActive = false;
    }

    /**
     * Mounts the Phoenix Daemon to the NodeJS process root to intercept fatal crashes.
     */
    mount() {
        if (this.isActive) return;
        this.isActive = true;

        logger.info('🦅 Phoenix Protocol: Daemon mounted. Listening for fatal runtime crashes.');

        process.on('uncaughtException', async (error) => {
            await this.handleFatalCrash(error, 'uncaughtException');
        });

        process.on('unhandledRejection', async (reason) => {
            await this.handleFatalCrash(reason instanceof Error ? reason : new Error(String(reason)), 'unhandledRejection');
        });
    }

    /**
     * Intercepts a crash, extracts the failing stack trace, and hallucinates a codebase patch.
     * @param {Error} error 
     * @param {string} type 
     */
    async handleFatalCrash(error, type) {
        logger.error(`🚨 Phoenix Protocol: Intercepted fatal ${type}!`, error);

        try {
            // 1. Analyze the stack trace to find the localized file
            // Assuming stack format: at functionName (file:///path/to/file.js:line:col)
            const stackLines = error.stack?.split('\n') || [];

            // Find the first stack line that references our local project codebase (not node_internals or modules)
            const targetedStackLine = stackLines.find(line =>
                line.includes('alti.code.studio.backend') && !line.includes('node_modules')
            );

            if (!targetedStackLine) {
                logger.warn('🦅 Phoenix Protocol: Could not map crash to local project file. Aborting autonomous repair.');
                return { success: false, reason: 'No local stack trace found' };
            }

            // Standardize path extraction (this handles Windows C:/ and file:/// URIs)
            const fileMatch = targetedStackLine.match(/\((?:file:\/\/\/)?([a-zA-Z0-9_:\/\.\-\\]+\.js)/);
            const funcMatch = targetedStackLine.match(/at\s+([a-zA-Z0-9_\.]+)\s+\(/);

            if (!fileMatch) {
                logger.warn('🦅 Phoenix Protocol: Regex failed to extract filepath from stack trace.');
                return { success: false, reason: 'Path extraction failed' };
            }

            let absolutePath = fileMatch[1];
            // Normalize path for Windows if it retained a leading slash (e.g. /C:/...)
            if (process.platform === 'win32' && absolutePath.startsWith('/')) {
                absolutePath = absolutePath.substring(1);
            }

            // Get function name (might be Class.method)
            let functionName = funcMatch ? funcMatch[1] : null;
            if (functionName && functionName.includes('.')) {
                functionName = functionName.split('.').pop();
            }

            logger.info(`🦅 Phoenix Protocol: Traced crash to ${functionName || 'anonymous'} in ${absolutePath}`);

            // 2. Read the source file
            const sourceCode = await fs.readFile(absolutePath, 'utf8');

            // 3. Extract the exact failing function mathematically using AST
            let failingCodeBlock = sourceCode; // Default to whole file if AST fails
            if (functionName) {
                const extracted = astService.extractFunction(sourceCode, functionName);
                if (extracted) failingCodeBlock = extracted;
            }

            // 4. Synthesize the patch via Gemini 3.1 Pro
            const repairPrompt = `You are the Phoenix Protocol. A fatal exception crashed the Node.js process.
            
            Error Trapped:
            ${error.stack}

            Failing Source Code Block:
            ${failingCodeBlock}

            Fix the code so this exact error never happens again. Add defensive null checks or type casting as necessary.
            Return ONLY the raw executed JavaScript replacement block. Do NOT include markdown formatting \`\`\`.
            `;

            logger.info('🦅 Phoenix Protocol: Asking Gemini to hallucinate a structural patch...');
            let rawPatch = await GeminiAiService.generateContent(repairPrompt);
            const engineeredPatch = rawPatch.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();

            logger.info('✅ Phoenix Protocol: Codebase patch successfully synthesized.');
            logger.info(`\n${engineeredPatch}\n`);

            // In a live production daemon, we would:
            // await fs.writeFile(absolutePath, sourceCode.replace(failingCodeBlock, engineeredPatch));
            // process.exit(1); // PM2 catches this and restarts with the new code

            return {
                success: true,
                patch: engineeredPatch,
                file: absolutePath
            };

        } catch (recoveryError) {
            logger.error('❌ Phoenix Protocol: Daemon catastrophically failed during recovery attempt.', recoveryError);
            return { success: false, reason: 'Daemon crash' };
        }
    }
}

export const phoenixService = new PhoenixService();
