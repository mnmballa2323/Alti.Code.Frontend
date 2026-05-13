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

class sedSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'sed_specialist',
            'sed Specialist',
            'You are an elite sed Specialist. You specialize in: Stream editor for filtering and transforming text.'
        );
    }

    async generatesedSystem(objective) {
        logger.info(`💻 [sedSpecialistAgent] Analyzing sed requirements...`);
        const prompt = `Analyze the sed requirement: ${objective}. Output valid sed code.`;
        try {
            const output = await this._invoke(prompt, "N/A - sed Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [sedSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const sedSpecialistAgentInstance = Object.freeze(new sedSpecialistAgent());
