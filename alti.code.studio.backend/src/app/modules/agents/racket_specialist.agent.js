/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class RacketSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'racket_specialist',
            'Racket Specialist',
            'You are an elite Racket Specialist. You specialize in: Language-oriented programming and dialect creation.'
        );
    }

    async generateRacketSystem(objective) {
        logger.info(`💻 [RacketSpecialistAgent] Analyzing Racket requirements...`);
        const prompt = `Analyze the Racket requirement: ${objective}. Output valid Racket code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Racket Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [RacketSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const RacketSpecialistAgentInstance = new RacketSpecialistAgent();
