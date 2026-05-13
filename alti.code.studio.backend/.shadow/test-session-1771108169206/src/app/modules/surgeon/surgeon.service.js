import fs from 'fs/promises';
import { logger } from '../../../shared/logger.js';
import { vertexService } from '../ai/vertex.service.js';

class CodeSurgeon {
    constructor() {
        this.mockMode = true;
    }

    /**
     * Diagnose and fix a file based on an error
     * @param {string} filePath 
     * @param {string} errorContext 
     */
    async operate(filePath, errorContext) {
        logger.info(`⚕️ Surgeon beginning operation on: ${filePath}`);

        try {
            // 1. Load File (Simple text read)
            const content = await fs.readFile(filePath, 'utf-8');

            // 2. Ask Vertex to Fix
            logger.info('⚕️ Surgeon consulting Vertex AI for a cure...');

            const prompt = `
            You are The Surgeon, an automated code repair agent.
            
            File Content:
            \`\`\`javascript
            ${content}
            \`\`\`
            
            Error Context:
            ${errorContext}
            
            Task:
            1. Analyze the error relative to the code.
            2. specific the exact code change needed to fix it.
            3. Return the FULL content of the file with the fix applied.
            
            Respond ONLY with the code block of the fixed file. No markdown formatting outside the code block.
            `;

            const fixedCodeRaw = await vertexService.generateContent(prompt);
            const fixedCode = fixedCodeRaw.replace(/```javascript/g, '').replace(/```/g, '').trim();

            // 3. Apply Fix (Write back to file)
            // In a real system, we'd use ShadowWorkspace here. 
            // For now, we apply directly but keep a backup (simulated by not deleting original immediately if we were using move, but fs.writeFile overwrites)

            await fs.writeFile(filePath, fixedCode);
            logger.info('⚕️ Surgeon applied fix to ' + filePath);

            return {
                status: 'fixed',
                file: filePath,
                notes: 'Vertex AI applied fix. Please review.'
            };
        } catch (error) {
            logger.error('⚕️ Surgeon failed to operate:', error);
            return { status: 'failed', error: error.message };
        }
    }
}

export const Surgeon = new CodeSurgeon();
