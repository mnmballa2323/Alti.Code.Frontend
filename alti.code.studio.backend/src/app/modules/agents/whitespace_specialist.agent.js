/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class WhitespaceSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'whitespace_specialist',
            'Whitespace Specialist',
            'You are an elite Whitespace Specialist. You specialize in: Invisible esoteric programming language.'
        );
    }

    async generateWhitespaceSystem(objective) {
        logger.info(`💻 [WhitespaceSpecialistAgent] Analyzing Whitespace requirements...`);
        const prompt = `Analyze the Whitespace requirement: ${objective}. Output valid Whitespace code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Whitespace Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [WhitespaceSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const WhitespaceSpecialistAgentInstance = new WhitespaceSpecialistAgent();
