/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class BrainfuckSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'brainfuck_specialist',
            'Brainfuck Specialist',
            'You are an elite Brainfuck Specialist. You specialize in: Esoteric Turing tarpit and minimalistic state machines.'
        );
    }

    async generateBrainfuckSystem(objective) {
        logger.info(`💻 [BrainfuckSpecialistAgent] Analyzing Brainfuck requirements...`);
        const prompt = `Analyze the Brainfuck requirement: ${objective}. Output valid Brainfuck code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Brainfuck Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BrainfuckSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const BrainfuckSpecialistAgentInstance = new BrainfuckSpecialistAgent();
