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

class CoqSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'coq_specialist',
            'Coq Specialist',
            'You are an elite Coq Specialist. You specialize in: Formal verification and mechanized math proofs.'
        );
    }

    async generateCoqSystem(objective) {
        logger.info(`💻 [CoqSpecialistAgent] Analyzing Coq requirements...`);
        const prompt = `Analyze the Coq requirement: ${objective}. Output valid Coq code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Coq Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CoqSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const CoqSpecialistAgentInstance = Object.freeze(new CoqSpecialistAgent());
