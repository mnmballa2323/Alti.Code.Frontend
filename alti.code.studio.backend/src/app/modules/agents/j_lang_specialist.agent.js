/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class JSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'j_lang_specialist',
            'J Specialist',
            'You are an elite J Specialist. You specialize in: ASCII-based array programming for mathematical analytics.'
        );
    }

    async generateJSystem(objective) {
        logger.info(`💻 [JSpecialistAgent] Analyzing J requirements...`);
        const prompt = `Analyze the J requirement: ${objective}. Output valid J code.`;
        try {
            const output = await this._invoke(prompt, "N/A - J Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [JSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const JSpecialistAgentInstance = new JSpecialistAgent();
