/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class KSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'k_lang_specialist',
            'K Specialist',
            'You are an elite K Specialist. You specialize in: Array processing language for financial analytics.'
        );
    }

    async generateKSystem(objective) {
        logger.info(`💻 [KSpecialistAgent] Analyzing K requirements...`);
        const prompt = `Analyze the K requirement: ${objective}. Output valid K code.`;
        try {
            const output = await this._invoke(prompt, "N/A - K Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [KSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const KSpecialistAgentInstance = new KSpecialistAgent();
