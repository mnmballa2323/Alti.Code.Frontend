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

class CloudAutomationPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_automation_planner_agent',
            'Cloud Automation Planner',
            'You are an elite Cloud Automation Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Automation.'
        );
    }

    async generateCloudAutomationSystem(objective) {
        logger.info(`💻 [CloudAutomationPlannerAgent] Analyzing Cloud Automation Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Automation Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Automation Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudAutomationPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudAutomationPlannerAgent = Object.freeze(new CloudAutomationPlannerAgent());
