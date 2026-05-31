/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class JuliaSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'julia_specialist',
            'Julia Specialist',
            'You are an elite Julia Specialist. You specialize in: High-performance numerical analysis and machine learning.'
        );
    }

    async generateJuliaSystem(objective) {
        logger.info(`💻 [JuliaSpecialistAgent] Analyzing Julia requirements...`);
        const prompt = `Analyze the Julia requirement: ${objective}. Output valid Julia code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Julia Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [JuliaSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const JuliaSpecialistAgentInstance = new JuliaSpecialistAgent();
