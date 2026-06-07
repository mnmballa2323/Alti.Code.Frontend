/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class MaxMSPSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'max_msp_specialist',
            'Max/MSP Specialist',
            'You are an elite Max/MSP Specialist. You specialize in: Visual programming for interactive media and sound.'
        );
    }

    async generateMaxMSPSystem(objective) {
        logger.info(`💻 [MaxMSPSpecialistAgent] Analyzing Max/MSP requirements...`);
        const prompt = `Analyze the Max/MSP requirement: ${objective}. Output valid Max/MSP code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Max/MSP Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [MaxMSPSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const MaxMSPSpecialistAgentInstance = new MaxMSPSpecialistAgent();
