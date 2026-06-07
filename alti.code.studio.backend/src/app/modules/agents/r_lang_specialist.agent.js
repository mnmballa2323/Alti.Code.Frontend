/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class RSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'r_lang_specialist',
            'R Specialist',
            'You are an elite R Specialist. You specialize in: Statistical computing, ggplot2 data visualization, and bio-informatics.'
        );
    }

    async generateRSystem(objective) {
        logger.info(`💻 [RSpecialistAgent] Analyzing R requirements...`);
        const prompt = `Analyze the R requirement: ${objective}. Output valid R code.`;
        try {
            const output = await this._invoke(prompt, "N/A - R Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [RSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const RSpecialistAgentInstance = new RSpecialistAgent();
