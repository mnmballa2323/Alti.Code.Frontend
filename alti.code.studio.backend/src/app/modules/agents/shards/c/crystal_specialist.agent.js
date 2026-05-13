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
import { logger } from '../../../../shared/logger.js';

class CrystalSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'crystal_specialist',
            'Crystal Specialist',
            'You are an elite Crystal Specialist. You specialize in: Ruby-like syntax with C-like performance and static typing.'
        );
    }

    async generateCrystalSystem(objective) {
        logger.info(`💻 [CrystalSpecialistAgent] Analyzing Crystal requirements...`);
        const prompt = `Analyze the Crystal requirement: ${objective}. Output valid Crystal code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Crystal Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CrystalSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const CrystalSpecialistAgentInstance = Object.freeze(new CrystalSpecialistAgent());
