/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ForthSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'forth_specialist',
            'Forth Specialist',
            'You are an elite Forth Specialist. You specialize in: Stack-based programming and embedded microcontroller control.'
        );
    }

    async generateForthSystem(objective) {
        logger.info(`💻 [ForthSpecialistAgent] Analyzing Forth requirements...`);
        const prompt = `Analyze the Forth requirement: ${objective}. Output valid Forth code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Forth Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ForthSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ForthSpecialistAgentInstance = new ForthSpecialistAgent();
