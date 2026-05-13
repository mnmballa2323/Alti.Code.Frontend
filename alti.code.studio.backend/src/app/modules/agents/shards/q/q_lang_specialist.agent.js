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

class QSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'q_lang_specialist',
            'Q Specialist',
            'You are an elite Q Specialist. You specialize in: Kdb+ time-series database queries for high-frequency trading.'
        );
    }

    async generateQSystem(objective) {
        logger.info(`💻 [QSpecialistAgent] Analyzing Q requirements...`);
        const prompt = `Analyze the Q requirement: ${objective}. Output valid Q code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Q Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [QSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const QSpecialistAgentInstance = Object.freeze(new QSpecialistAgent());
