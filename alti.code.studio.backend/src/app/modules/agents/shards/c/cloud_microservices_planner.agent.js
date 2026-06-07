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

class CloudMicroservicesPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_microservices_planner_agent',
            'Cloud Microservices Planner',
            'You are an elite Cloud Microservices Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Microservices.'
        );
    }

    async generateCloudMicroservicesSystem(objective) {
        logger.info(`💻 [CloudMicroservicesPlannerAgent] Analyzing Cloud Microservices Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Microservices Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Microservices Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudMicroservicesPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudMicroservicesPlannerAgent = Object.freeze(new CloudMicroservicesPlannerAgent());
