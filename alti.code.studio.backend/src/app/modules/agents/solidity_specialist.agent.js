/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class SoliditySpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'solidity_specialist',
            'Solidity Specialist',
            'You are an elite Solidity Specialist. You specialize in: Ethereum smart contracts, DeFi protocols, and Web3 logic.'
        );
    }

    async generateSoliditySystem(objective) {
        logger.info(`💻 [SoliditySpecialistAgent] Analyzing Solidity requirements...`);
        const prompt = `Analyze the Solidity requirement: ${objective}. Output valid Solidity code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Solidity Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SoliditySpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const SoliditySpecialistAgentInstance = new SoliditySpecialistAgent();
