/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';

export class DemystifierAgent {
    constructor() {
        this.name = 'TheDemystifier';
        logger.info('🕵️‍♂️ DemystifierAgent: Real-Time Reverse Engineering initialized.');
    }

    /**
     * Intercepts a raw stack trace, isolates the crash point in minified code, and translates it.
     * @param {string} rawStackTrace The string representation of the V8 stack trace
     * @returns {string} Plain English explanation of the algorithmic failure
     */
    async analyzeCrash(rawStackTrace) {
        logger.info(`🕵️‍♂️ DemystifierAgent: Intercepted vague stack trace. Initiating deep reverse-engineering pipeline...`);

        // 1. Extract the likely file path and line number from the stack trace
        const { filePath, line, col } = this._extractCrashCoordinates(rawStackTrace);

        if (!filePath) {
            return "Could not identify a compiled file path in the stack trace.";
        }

        logger.info(`🕵️‍♂️ DemystifierAgent: Extracted crash coordinates -> [${filePath}:${line}:${col}]`);

        // 2. Read the minified file
        let minifiedCode = '';
        try {
            minifiedCode = await fs.readFile(filePath, 'utf8');
        } catch (error) {
            logger.error(`🕵️‍♂️ DemystifierAgent: Failed to read compiled file at ${filePath}`);
            return "Failed to access the compiled bundle on disk.";
        }

        // 3. Extract the exact crash context (e.g., the specific minified block)
        // For simplicity in this agent, we'll grab a chunk of the file around the column
        const codeSnippet = this._extractSnippet(minifiedCode, col);

        // 4. Translate back to Human Logic via LLM
        const explanation = await this._translateObfuscation(codeSnippet, rawStackTrace);
        return explanation;
    }

    _extractCrashCoordinates(stackTrace) {
        // Regex to match typical Node.js / V8 stack trace paths: at (path/to/file.js:line:col)
        const match = stackTrace.match(/at\s+.*?\s+\(?(.*?:(\d+):(\d+))\)?/);
        if (match) {
            const fullPath = match[1].split(':');
            return {
                filePath: fullPath[0],
                line: parseInt(fullPath[1] || '1', 10),
                col: parseInt(fullPath[2] || '0', 10)
            };
        }
        return { filePath: null, line: null, col: null };
    }

    _extractSnippet(code, col) {
        // Grab 100 characters around the column of the single minified line
        const start = Math.max(0, col - 50);
        const end = Math.min(code.length, col + 50);
        return code.substring(start, end);
    }

    async _translateObfuscation(minifiedSnippet, stackTrace) {
        const prompt = `You are an expert Reverse Engineer. The user encountered an opaque crash in a compiled/minified dependency.
        
        Stack Trace:
        ${stackTrace}

        Minified Code Snippet around the crash point:
        \`\`\`javascript
        ${minifiedSnippet}
        \`\`\`

        The variables are obfuscated (e.g., 'a', 'b', 'c'). 
        Analyze the context. Translate what this minified logic was likely trying to do, and explain why it crashed in simple, human-readable English.
        Do not describe your process, just provide the direct explanation of the bug.`;

        const result = await GeminiAiService.generateContent(prompt);
        return result.trim();
    }
}

export const demystifierAgent = new DemystifierAgent();
