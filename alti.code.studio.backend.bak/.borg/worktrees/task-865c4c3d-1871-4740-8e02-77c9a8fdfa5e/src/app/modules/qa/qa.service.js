/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class QAService {
    /**
     * Generates a Vitest specification for a given source file.
     * @param {string} sourceFile - Absolute path to the source file.
     * @returns {Promise<{success: boolean, testFile: string, content: string}>}
     */
    async generateSpec(sourceFile) {
        logger.info(`🧪 QA Architect analyzing: ${sourceFile}`);

        try {
            // 1. Read Source Code
            const sourceCode = await fs.readFile(sourceFile, 'utf-8');
            const fileName = path.basename(sourceFile);
            const testFileName = sourceFile.replace('.js', '.test.js');

            // 2. Prompt Vertex AI
            const prompt = `
            You are the QA Architect, an expert in testing Node.js applications with Vitest.
            
            Task: Write a comprehensive unit test suite for the following module.
            
            Module Name: ${fileName}
            Source Code:
            \`\`\`javascript
            ${sourceCode}
            \`\`\`
            
            Requirements:
            1. Use 'vitest' (import { describe, it, expect, vi, beforeEach } from 'vitest').
            2. Mock any external dependencies (imports) using 'vi.mock()'.
            3. Cover success paths and error handling.
            4. Structure the tests clearly with 'describe' blocks.
            5. Return ONLY the javascript code for the test file. No markdown fences if possible, or inside \`\`\`javascript blocks.
            `;

            logger.info('🧪 Consulting Vertex AI for test cases...');
            const rawResponse = await GeminiAiService.generateContent(prompt);

            // Clean response (strip markdown)
            const cleanedCode = rawResponse
                .replace(/^```javascript\n/, '')
                .replace(/^```\n/, '')
                .replace(/\n```$/, '')
                .trim();

            // 3. (Optional) Write file?
            // The plan says "outputs file.test.js". 
            // In a real agentic loop, we might write it. For now, let's return it so the MCP tool can decide.
            // But to be helpful, let's write it if it doesn't exist.

            // Check if test file exists
            try {
                await fs.access(testFileName);
                logger.warn(`🧪 Test file already exists: ${testFileName}. Returning generated content but NOT overwriting.`);
            } catch {
                // Determine relative path for imports in the test file might be tricky if Vertex gets it wrong.
                // But usually standard 'import ... from "./file.js"' works if they are siblings.
                await fs.writeFile(testFileName, cleanedCode);
                logger.info(`🧪 Generated test file: ${testFileName}`);
            }

            return {
                success: true,
                testFile: testFileName,
                content: cleanedCode
            };

        } catch (error) {
            logger.error('🧪 QA Generation failed', error);
            return { success: false, error: error.message };
        }
    }
}

export const qaService = new QAService();
