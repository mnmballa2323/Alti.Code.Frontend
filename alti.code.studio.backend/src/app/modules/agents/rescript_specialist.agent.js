/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ReScriptSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'rescript_specialist',
            'ReScript Specialist',
            'You are an elite ReScript Specialist. You specialize in: Fast, typed JavaScript alternative for React ecosystems.'
        );
    }

    async generateReScriptSystem(objective) {
        logger.info(`💻 [ReScriptSpecialistAgent] Analyzing ReScript requirements...`);
        const prompt = `Analyze the ReScript requirement: ${objective}. Output valid ReScript code.`;
        try {
            const output = await this._invoke(prompt, "N/A - ReScript Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ReScriptSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ReScriptSpecialistAgentInstance = new ReScriptSpecialistAgent();
