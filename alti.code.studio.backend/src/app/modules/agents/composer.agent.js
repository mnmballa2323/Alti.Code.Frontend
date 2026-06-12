/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { smartFileWriter } from './smart_file_writer.service.js';

const MINIMAL_SCAFFOLD_FALLBACK = (feature, instruction) =>
    `// [Composer] Scaffolded for: ${feature}\n// Task: ${instruction}\n// TODO: Implement this module.\n\nexport default {};\n`;

class ComposerAgent {
    constructor() {
        this.name = 'Composer_Agent';
        this.agentName = 'composer';
        this.capabilities = ['scaffold', 'writeCode'];
        this.description = 'Agent for scaffolding features and composing multi-file code execution plans.';
        this.preamble = 'You are the Composer, an expert software architect that plans and scaffolds full features.';
        this.projectRoot = process.cwd();
    }

    async consult(query, contextData) {
        // Map the standard agent contract to Composer's execute method
        return this.execute('writeCode', { feature: query, context: contextData });
    }

    async execute(action, args) {
        logger.info(`🎹 Composer: Executing ${action}`);
        switch (action) {
            case 'writeCode':
                return this.compose(args.feature);
            case 'scaffold':
                return this.scaffoldFeature(args.design);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async compose(request) {
        logger.info(`🎹 Composer: Starting composition for "${request}"`);

        // 1. Get File Structure (depth 2 scan for speed)
        const fileStructure = await this._scanDir(this.projectRoot, 2);

        // 2. Plan Implementation
        const plan = await this._createPlan(request, fileStructure);
        logger.info(`🎹 Composer: Generated plan with ${plan.files.length} operations.`);

        // 3. Execute Plan
        return await this._executePlan(plan);
    }

    /**
     * Scaffold a feature by generating real LLM content for each file.
     * Falls back to a minimal placeholder if the LLM returns an empty response.
     * @param {{ feature: string, files: Array<{ path: string, instruction: string }> }} design
     */
    async scaffoldFeature(design) {
        logger.info(`🎹 Composer: Scaffolding feature "${design.feature}" from Design Doc...`);

        const results = [];

        for (const file of design.files) {
            logger.info(`🎹 Composer: Generating ${file.path}...`);
            try {
                // Generate real code via the LLM
                let content = await this._generateContent(file.path, file.instruction, design.feature);

                // Safeguard: if LLM returns nothing useful, use a minimal scaffold
                if (!content || content.trim().length < 10) {
                    logger.warn(`🎹 Composer: LLM returned empty response for ${file.path}, using fallback scaffold.`);
                    content = MINIMAL_SCAFFOLD_FALLBACK(design.feature, file.instruction);
                }

                await this._writeFile(file.path, content);
                results.push(`✅ CREATED ${file.path}`);
            } catch (error) {
                logger.error(`Failed to scaffold ${file.path}`, error);
                // Write a minimal fallback so the file at least exists
                try {
                    await this._writeFile(file.path, MINIMAL_SCAFFOLD_FALLBACK(design.feature, file.instruction));
                    results.push(`⚠️ FALLBACK ${file.path}: ${error.message}`);
                } catch {
                    results.push(`❌ FAILED ${file.path}: ${error.message}`);
                }
            }
        }

        return results;
    }

    async _executePlan(plan) {
        const results = [];
        for (const op of plan.files) {
            try {
                if (op.type === 'create' || op.type === 'edit') {
                    const content = await this._generateContent(op.path, op.instruction, 'Execute Plan');
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
        if (depth < 0) return [];
        let results = [];
        try {
            const list = await fs.readdir(dir, { withFileTypes: true });
            for (const file of list) {
                if (file.name === 'node_modules' || file.name === '.git') continue;
                if (file.isDirectory()) {
                    results.push(`${file.name}/`);
                    const children = await this._scanDir(path.join(dir, file.name), depth - 1);
                    results.push(...children.map(c => `  ${c}`));
                } else {
                    results.push(file.name);
                }
            }
        } catch {
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
        Task: Write production-quality code for "${filePath}".
        Instruction: ${instruction}
        Context Request: ${originalRequest}
        
        Return ONLY the code. No markdown fences, no explanations.
        `;

        const content = await GeminiAiService.generateContent(prompt);
        return content.replace(/^```[a-z]*\n?/m, '').replace(/```\s*$/m, '').trim();
    }

    async _writeFile(relPath, content) {
        const fullPath = path.resolve(this.projectRoot, relPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        // Phase 49: Route write through CRDT Engine for Ghost Typing.
        // Identify active document ID based on the project path (using a mock ID for Phase 48 demo, 
        // or a derived ID based on path signature)
        const documentId = 'workspace-123'; // Mock linked to frontend MonacoEditor

        await smartFileWriter.writeFile(fullPath, content, documentId);
    }
}

export const composerAgent = new ComposerAgent();
