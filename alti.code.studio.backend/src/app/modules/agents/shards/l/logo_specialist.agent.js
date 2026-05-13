// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

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
export const LogoSpecialistAgentInstance = Object.freeze(new LogoSpecialistAgent());
