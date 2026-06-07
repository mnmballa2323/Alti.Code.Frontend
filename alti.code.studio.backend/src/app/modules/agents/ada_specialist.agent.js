/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class AdaSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ada_specialist',
            'Ada Specialist',
            'You are an elite Ada Specialist. You specialize in: Mission-critical avionics, defense systems, and high-integrity software.'
        );
    }

    async generateAdaSystem(objective) {
        logger.info(`💻 [AdaSpecialistAgent] Analyzing Ada requirements...`);
        const prompt = `Analyze the Ada requirement: ${objective}. Output valid Ada code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Ada Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AdaSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const AdaSpecialistAgentInstance = new AdaSpecialistAgent();
