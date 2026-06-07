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

class SecurityMicroservicesPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'security_microservices_planner_agent',
            'Security Microservices Planner',
            'You are an elite Security Microservices Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Security Microservices.'
        );
    }

    async generateSecurityMicroservicesSystem(objective) {
        logger.info(`💻 [SecurityMicroservicesPlannerAgent] Analyzing Security Microservices Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Security Microservices Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Security Microservices Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SecurityMicroservicesPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const securityMicroservicesPlannerAgent = Object.freeze(new SecurityMicroservicesPlannerAgent());
