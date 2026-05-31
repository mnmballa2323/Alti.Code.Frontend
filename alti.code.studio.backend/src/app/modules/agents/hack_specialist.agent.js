/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class HackSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'hack_specialist',
            'Hack Specialist',
            'You are an elite Hack Specialist. You specialize in: HHVM performance, strictly typed PHP for Meta architectures.'
        );
    }

    async generateHackSystem(objective) {
        logger.info(`💻 [HackSpecialistAgent] Analyzing Hack requirements...`);
        const prompt = `Analyze the Hack requirement: ${objective}. Output valid Hack code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Hack Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [HackSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const HackSpecialistAgentInstance = new HackSpecialistAgent();
