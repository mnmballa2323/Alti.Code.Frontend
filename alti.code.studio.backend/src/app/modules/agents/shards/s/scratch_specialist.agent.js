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

class ScratchSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'scratch_specialist',
            'Scratch Specialist',
            'You are an elite Scratch Specialist. You specialize in: Block-based visual programming for early education.'
        );
    }

    async generateScratchSystem(objective) {
        logger.info(`💻 [ScratchSpecialistAgent] Analyzing Scratch requirements...`);
        const prompt = `Analyze the Scratch requirement: ${objective}. Output valid Scratch code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Scratch Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ScratchSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ScratchSpecialistAgentInstance = Object.freeze(new ScratchSpecialistAgent());
