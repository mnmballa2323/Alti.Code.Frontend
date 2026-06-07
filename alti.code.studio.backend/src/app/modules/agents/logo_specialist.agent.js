/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class LogoSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'logo_specialist',
            'Logo Specialist',
            'You are an elite Logo Specialist. You specialize in: Turtle graphics and educational spatial reasoning.'
        );
    }

    async generateLogoSystem(objective) {
        logger.info(`💻 [LogoSpecialistAgent] Analyzing Logo requirements...`);
        const prompt = `Analyze the Logo requirement: ${objective}. Output valid Logo code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Logo Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [LogoSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const LogoSpecialistAgentInstance = new LogoSpecialistAgent();
