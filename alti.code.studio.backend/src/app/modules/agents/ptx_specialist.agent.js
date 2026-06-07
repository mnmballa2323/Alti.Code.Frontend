/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class PTXSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ptx_specialist',
            'PTX Specialist',
            'You are an elite PTX Specialist. You specialize in: Parallel Thread Execution for Nvidia low-level GPU control.'
        );
    }

    async generatePTXSystem(objective) {
        logger.info(`💻 [PTXSpecialistAgent] Analyzing PTX requirements...`);
        const prompt = `Analyze the PTX requirement: ${objective}. Output valid PTX code.`;
        try {
            const output = await this._invoke(prompt, "N/A - PTX Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [PTXSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const PTXSpecialistAgentInstance = new PTXSpecialistAgent();
