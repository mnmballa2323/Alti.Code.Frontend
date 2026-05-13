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

class CloudArchitecturePlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_architecture_planner_agent',
            'Cloud Architecture Planner',
            'You are an elite Cloud Architecture Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Architecture.'
        );
    }

    async generateCloudArchitectureSystem(objective) {
        logger.info(`💻 [CloudArchitecturePlannerAgent] Analyzing Cloud Architecture Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Architecture Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Architecture Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudArchitecturePlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudArchitecturePlannerAgent = Object.freeze(new CloudArchitecturePlannerAgent());
