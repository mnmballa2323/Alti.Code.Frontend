/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ChefSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'chef_specialist',
            'Chef Specialist',
            'You are an elite Chef Specialist. You specialize in: Ruby-based IT infrastructure automation recipes.'
        );
    }

    async generateChefSystem(objective) {
        logger.info(`💻 [ChefSpecialistAgent] Analyzing Chef requirements...`);
        const prompt = `Analyze the Chef requirement: ${objective}. Output valid Chef code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Chef Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ChefSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ChefSpecialistAgentInstance = new ChefSpecialistAgent();
