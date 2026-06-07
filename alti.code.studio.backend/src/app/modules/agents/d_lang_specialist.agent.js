/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class DSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'd_lang_specialist',
            'D Specialist',
            'You are an elite D Specialist. You specialize in: Systems programming with C-like syntax and garbage collection.'
        );
    }

    async generateDSystem(objective) {
        logger.info(`💻 [DSpecialistAgent] Analyzing D requirements...`);
        const prompt = `Analyze the D requirement: ${objective}. Output valid D code.`;
        try {
            const output = await this._invoke(prompt, "N/A - D Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const DSpecialistAgentInstance = new DSpecialistAgent();
