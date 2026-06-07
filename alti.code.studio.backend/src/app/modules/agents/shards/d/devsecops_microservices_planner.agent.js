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

class DevSecOpsMicroservicesPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'devsecops_microservices_planner_agent',
            'DevSecOps Microservices Planner',
            'You are an elite DevSecOps Microservices Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Microservices.'
        );
    }

    async generateDevSecOpsMicroservicesSystem(objective) {
        logger.info(`💻 [DevSecOpsMicroservicesPlannerAgent] Analyzing DevSecOps Microservices Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Microservices Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - DevSecOps Microservices Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DevSecOpsMicroservicesPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const devSecOpsMicroservicesPlannerAgent = Object.freeze(new DevSecOpsMicroservicesPlannerAgent());
