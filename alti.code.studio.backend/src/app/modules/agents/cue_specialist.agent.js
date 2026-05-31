/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class CUESpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cue_specialist',
            'CUE Specialist',
            'You are an elite CUE Specialist. You specialize in: Data validation and configuration language.'
        );
    }

    async generateCUESystem(objective) {
        logger.info(`💻 [CUESpecialistAgent] Analyzing CUE requirements...`);
        const prompt = `Analyze the CUE requirement: ${objective}. Output valid CUE code.`;
        try {
            const output = await this._invoke(prompt, "N/A - CUE Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CUESpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const CUESpecialistAgentInstance = new CUESpecialistAgent();
