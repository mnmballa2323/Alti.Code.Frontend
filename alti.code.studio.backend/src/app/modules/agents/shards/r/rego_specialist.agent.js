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

class RegoSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'rego_specialist',
            'Rego Specialist',
            'You are an elite Rego Specialist. You specialize in: Open Policy Agent (OPA) policy definition language.'
        );
    }

    async generateRegoSystem(objective) {
        logger.info(`💻 [RegoSpecialistAgent] Analyzing Rego requirements...`);
        const prompt = `Analyze the Rego requirement: ${objective}. Output valid Rego code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Rego Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [RegoSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const RegoSpecialistAgentInstance = Object.freeze(new RegoSpecialistAgent());
