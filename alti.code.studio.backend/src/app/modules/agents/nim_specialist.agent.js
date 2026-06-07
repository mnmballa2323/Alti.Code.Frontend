/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class NimSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'nim_specialist',
            'Nim Specialist',
            'You are an elite Nim Specialist. You specialize in: Metaprogramming, AST macros, compiling to C/C++/JavaScript.'
        );
    }

    async generateNimSystem(objective) {
        logger.info(`💻 [NimSpecialistAgent] Analyzing Nim requirements...`);
        const prompt = `Analyze the Nim requirement: ${objective}. Output valid Nim code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Nim Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [NimSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const NimSpecialistAgentInstance = new NimSpecialistAgent();
