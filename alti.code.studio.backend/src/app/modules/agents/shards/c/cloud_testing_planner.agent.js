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

class CloudTestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_testing_planner_agent',
            'Cloud Testing Planner',
            'You are an elite Cloud Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Testing.'
        );
    }

    async generateCloudTestingSystem(objective) {
        logger.info(`💻 [CloudTestingPlannerAgent] Analyzing Cloud Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudTestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudTestingPlannerAgent = Object.freeze(new CloudTestingPlannerAgent());
