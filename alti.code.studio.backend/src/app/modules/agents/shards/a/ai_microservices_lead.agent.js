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

class AIMicroservicesLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_microservices_lead_agent',
            'AI Microservices Lead',
            'You are an elite AI Microservices Lead. You specialize in bleeding-edge software development, cloud infrastructure, and AI Microservices.'
        );
    }

    async generateAIMicroservicesSystem(objective) {
        logger.info(`💻 [AIMicroservicesLeadAgent] Analyzing AI Microservices Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Microservices Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Microservices Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIMicroservicesLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIMicroservicesLeadAgent = Object.freeze(new AIMicroservicesLeadAgent());
