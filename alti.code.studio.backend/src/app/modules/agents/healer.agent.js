/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { GitAgentService } from '../gitAgent/gitAgent.service.js';
import fs from 'fs/promises';
import { smartFileWriter } from './smart_file_writer.service.js';

class HealerAgent {
    constructor() {
        this.name = "The Healer";
        this.agentName = "healer";
        this.capabilities = ['heal'];
    }

    async execute(action, args) {
        logger.info(`🩹 Healer: Executing ${action}`);
        if (action === 'heal') {
            return this.heal(args.filePath, args.errorLog);
        }
        throw new Error(`Unknown action: ${action}`);
    }

    /**
     * Attempt to heal a specific error in a file
     * @param {string} filePath - Path to the broken file
     * @param {string} errorLog - The error message or test failure
     */
    async heal(filePath, errorLog) {
        logger.info(`🩹 Healer: Attempting to fix ${filePath}...`);

        try {
            // 1. Read the broken file
            const fileContent = await fs.readFile(filePath, 'utf-8');

            // 2. Ask Gemini for a fix
            const prompt = `
                You are "The Healer", an autonomous code repair agent.
                
                BROKEN FILE (${filePath}):
                \`\`\`javascript
                ${fileContent}
                \`\`\`

                ERROR LOG:
                ${errorLog}

                TASK:
                Return the FIXED code for the entire file. 
                Do not include markdown formatting or explanations. 
                Just the raw code.
            `;

            logger.info(`🩹 Healer: Consulting Gemini...`);
            const fixedCode = await GeminiAiService.generateContent(prompt);

            // 3. Apply the fix
            // Clean up potential markdown blocks if Gemini adds them
            const cleanCode = fixedCode.replace(/```javascript/g, '').replace(/```/g, '').trim();

            // Phase 49: Route write through CRDT Engine for Ghost Typing
            const documentId = 'workspace-123'; // Mock linked to frontend MonacoEditor
            await smartFileWriter.writeFile(filePath, cleanCode, documentId);

            logger.info(`✅ Healer: Applied fix to ${filePath}`);

            // 4. Verification (Mocked for now - in real life, run tests here)
            // if (testsPass) { ... }

            // 5. Auto-Commit
            await GitAgentService.commitChanges(`[HEALER] Auto-fixed error in ${filePath.split('/').pop()}`);
            logger.info(`💾 Healer: Auto-committed fix.`);

            return { success: true, fixedFile: filePath };

        } catch (error) {
            logger.error(`❌ Healer Failed:`, error);
            return { success: false, error: error.message };
        }
    }
}

export const healerAgent = new HealerAgent();
