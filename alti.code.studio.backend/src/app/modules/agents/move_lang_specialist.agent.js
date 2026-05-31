/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class MoveSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'move_lang_specialist',
            'Move Specialist',
            'You are an elite Move Specialist. You specialize in: Secure smart contracts for Aptos and Sui blockchains.'
        );
    }

    async generateMoveSystem(objective) {
        logger.info(`💻 [MoveSpecialistAgent] Analyzing Move requirements...`);
        const prompt = `Analyze the Move requirement: ${objective}. Output valid Move code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Move Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [MoveSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const MoveSpecialistAgentInstance = new MoveSpecialistAgent();
