/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ChiselSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'chisel_specialist',
            'Chisel Specialist',
            'You are an elite Chisel Specialist. You specialize in: Constructing Hardware in a Scala Embedded Language.'
        );
    }

    async generateChiselSystem(objective) {
        logger.info(`💻 [ChiselSpecialistAgent] Analyzing Chisel requirements...`);
        const prompt = `Analyze the Chisel requirement: ${objective}. Output valid Chisel code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Chisel Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ChiselSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ChiselSpecialistAgentInstance = new ChiselSpecialistAgent();
