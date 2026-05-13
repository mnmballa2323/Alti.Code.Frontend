// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { astPatcherService } from '../ast/ast_patcher.service.js';
import { logger } from '../../../../shared/logger.js';

class GeminiRefactorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'gemini_refactor',
            'Advanced AST Code Refactorer (Gemini CLI Native)',
            'You are a Gemini CLI-native refactoring agent. Your output must strictly be a JSON array of AST Patches formatted for web-tree-sitter consumption.'
        );
    }

    /**
     * Refactors a file by utilizing the Gemini CLI and streaming the AST patches to the AST engine.
     * @param {string} sourceCode
     * @param {string} refactorIntent
     * @returns {Promise<string>} Refactored code
     */
    async refactorFile(sourceCode, refactorIntent) {
        logger.info(`✨ [GeminiRefactorAgent] Initiating CLI-driven refactor... Intent: ${refactorIntent}`);

        const prompt = `
Refactor the following code according to the intent: "${refactorIntent}"
Return an array of JSON objects matching the AST patch format. Do not return raw code.
Format:
[
  {
    "nodeQuery": "(function_declaration) @target",
    "replacementCode": "function newFunc() {}"
  }
]
        `;

        // Native invoke pipes directly to `gemini ask` process
        const rawCliOutput = await this._invoke(prompt, sourceCode);

        try {
            // Strip any markdown artifacts from the CLI output stream
            const cleanOutput = rawCliOutput.replace(/```json|```/g, '').trim();
            const patches = JSON.parse(cleanOutput);

            logger.info(`✨ [GeminiRefactorAgent] Generated ${patches.length} AST patches. Forwarding to AST Patcher...`);

            // Pass to the strict AST engine (Phase 3 functionality) and embed into Hive Mind
            const newCode = await astPatcherService.applyPatches(sourceCode, patches, 'javascript', refactorIntent);
            return newCode;

        } catch (err) {
            logger.error(`❌ [GeminiRefactorAgent] Failed to parse CLI output into AST patches: ${err.message}`);
            throw err;
        }
    }
}

export const geminiRefactorAgent = Object.freeze(new GeminiRefactorAgent());
