/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class DhallSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'dhall_specialist',
            'Dhall Specialist',
            'You are an elite Dhall Specialist. You specialize in: Programmable, safe configuration language.'
        );
    }

    async generateDhallSystem(objective) {
        logger.info(`💻 [DhallSpecialistAgent] Analyzing Dhall requirements...`);
        const prompt = `Analyze the Dhall requirement: ${objective}. Output valid Dhall code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Dhall Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DhallSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const DhallSpecialistAgentInstance = new DhallSpecialistAgent();
