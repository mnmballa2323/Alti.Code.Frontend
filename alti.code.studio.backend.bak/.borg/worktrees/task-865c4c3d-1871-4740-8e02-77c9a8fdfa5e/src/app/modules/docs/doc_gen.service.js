/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';

class DocGenService {
    /**
     * generating JSDoc for a given file
     * @param {string} filePath 
     */
    async enrichFile(filePath) {
        try {
            logger.info(`📜 The Librarian: Reading ${filePath}...`);
            const content = await fs.readFile(filePath, 'utf8');

            const prompt = `
                You are a Senior Technical Writer. 
                Add JSDoc comments to the following JavaScript code. 
                - Document parameters, return types, and exceptions.
                - Use @param, @returns, @throws.
                - Do NOT change the code logic. Only add comments.
                - Return the FULL file content with comments added.
                - Do not use markdown backticks. Just the raw code.

                Code:
                ${content}
            `;

            logger.info('📜 The Librarian: Generating documentation with AI...');
            const enrichedCode = await GeminiAiService.generateContent(prompt);

            // Cleanup potential markdown formating from AI
            const cleanCode = enrichedCode.replace(/^```javascript/, '').replace(/^```/, '').replace(/```$/, '');

            await fs.writeFile(filePath, cleanCode.trim());
            logger.info(`✅ Documentation added to ${filePath}`);
            return true;

        } catch (error) {
            logger.error(`❌ DocGen Failed: ${error.message}`);
            return false;
        }
    }
}

export const docGenService = new DocGenService();
