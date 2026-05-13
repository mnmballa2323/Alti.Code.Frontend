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

class ComposerAgent {
    constructor() {
        this.projectRoot = process.cwd();
    }

    async compose(request) {
        logger.info(`🎹 Composer: Starting composition for "${request}"`);

        // 1. Get File Structure (Mocking depth 2 scan for speed)
        const fileStructure = await this._scanDir(this.projectRoot, 2);

        // 2. Plan Implementation
        const plan = await this._createPlan(request, fileStructure);
        logger.info(`🎹 Composer: Generated plan with ${plan.files.length} operations.`);

        // 3. Execute Plan
        const results = [];
        for (const op of plan.files) {
            try {
                if (op.type === 'create' || op.type === 'edit') {
                    const content = await this._generateContent(op.path, op.instruction, request);
                    await this._writeFile(op.path, content);
                    results.push(`✅ ${op.type.toUpperCase()} ${op.path}`);
                } else if (op.type === 'delete') {
                    await fs.unlink(path.resolve(this.projectRoot, op.path)).catch(() => { });
                    results.push(`❌ DELETED ${op.path}`);
                }
            } catch (error) {
                logger.error(`Failed to execute op on ${op.path}`, error);
                results.push(`⚠️ FAILED ${op.path}: ${error.message}`);
            }
        }

        return results;
    }

    async _scanDir(dir, depth) {
        // Simplified recursive scan
        if (depth < 0) return [];
        let results = [];
        try {
            const list = await fs.readdir(dir, { withFileTypes: true });
            for (const file of list) {
                if (file.name === 'node_modules' || file.name === '.git') continue;
                const resPath = path.resolve(dir, file.name);
                if (file.isDirectory()) {
                    results.push(`${file.name}/`);
                    // recursing... (omitted for brevity in this initial version)
                } else {
                    results.push(file.name);
                }
            }
        } catch (e) {
            return [];
        }
        return results;
    }

    async _createPlan(request, fileStructure) {


        const prompt = `
        You are the Composer, an expert software architect.
        User Request: "${request}"
        
        Current Files:
        ${JSON.stringify(fileStructure, null, 2)}
        
        Return a JSON object with a list of file operations:
        {
            "files": [
                { "type": "create", "path": "src/utils/helpers.js", "instruction": "Write helper functions for X" },
                { "type": "edit", "path": "src/main.js", "instruction": "Import helpers and use them" }
            ]
        }
        Do not return markdown. Just JSON.
        `;

        try {
            const response = await GeminiAiService.generateContent(prompt);
            // Naive JSON extraction
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            logger.error('Composer Plan Failed', e);
            throw e;
        }
    }

    async _generateContent(filePath, instruction, originalRequest) {


        const prompt = `
        You are the Composer.
        Task: Write code for "${filePath}".
        Instruction: ${instruction}
        Context Request: ${originalRequest}
        
        Return ONLY the code. No markdown.
        `;

        const content = await GeminiAiService.generateContent(prompt);
        return content.replace(/```[a-z]*\n/g, '').replace(/```$/g, '');
    }

    async _writeFile(relPath, content) {
        const fullPath = path.resolve(this.projectRoot, relPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content);
    }
}

export const composerAgent = new ComposerAgent();
