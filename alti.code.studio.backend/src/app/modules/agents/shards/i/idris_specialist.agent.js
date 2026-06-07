// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class IdrisSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'idris_specialist',
            'Idris Specialist',
            'You are an elite Idris Specialist. You specialize in: Dependent types, theorem proving, and functional paradigms.'
        );
    }

    async generateIdrisSystem(objective) {
        logger.info(`💻 [IdrisSpecialistAgent] Analyzing Idris requirements...`);
        const prompt = `Analyze the Idris requirement: ${objective}. Output valid Idris code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Idris Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [IdrisSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const IdrisSpecialistAgentInstance = Object.freeze(new IdrisSpecialistAgent());
