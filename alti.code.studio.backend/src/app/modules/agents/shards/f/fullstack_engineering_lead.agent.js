// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class FullStackEngineeringLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_engineering_lead_agent',
            'FullStack Engineering Lead',
            'You are an elite FullStack Engineering Lead. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Engineering.'
        );
    }

    async generateFullStackEngineeringSystem(objective) {
        logger.info(`💻 [FullStackEngineeringLeadAgent] Analyzing FullStack Engineering Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Engineering Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Engineering Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackEngineeringLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackEngineeringLeadAgent = Object.freeze(new FullStackEngineeringLeadAgent());
