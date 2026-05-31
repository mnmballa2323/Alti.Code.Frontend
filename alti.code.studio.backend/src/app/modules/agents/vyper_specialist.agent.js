/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class VyperSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'vyper_specialist',
            'Vyper Specialist',
            'You are an elite Vyper Specialist. You specialize in: Pythonic smart contracts for the Ethereum Virtual Machine.'
        );
    }

    async generateVyperSystem(objective) {
        logger.info(`💻 [VyperSpecialistAgent] Analyzing Vyper requirements...`);
        const prompt = `Analyze the Vyper requirement: ${objective}. Output valid Vyper code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Vyper Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [VyperSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const VyperSpecialistAgentInstance = new VyperSpecialistAgent();
