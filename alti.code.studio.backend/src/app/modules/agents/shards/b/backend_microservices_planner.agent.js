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

class BackendMicroservicesPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_microservices_planner_agent',
            'Backend Microservices Planner',
            'You are an elite Backend Microservices Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Microservices.'
        );
    }

    async generateBackendMicroservicesSystem(objective) {
        logger.info(`💻 [BackendMicroservicesPlannerAgent] Analyzing Backend Microservices Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Microservices Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Microservices Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendMicroservicesPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendMicroservicesPlannerAgent = Object.freeze(new BackendMicroservicesPlannerAgent());
