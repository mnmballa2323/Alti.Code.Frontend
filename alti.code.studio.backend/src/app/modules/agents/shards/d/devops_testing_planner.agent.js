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

class DevOpsTestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'devops_testing_planner_agent',
            'DevOps Testing Planner',
            'You are an elite DevOps Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Testing.'
        );
    }

    async generateDevOpsTestingSystem(objective) {
        logger.info(`💻 [DevOpsTestingPlannerAgent] Analyzing DevOps Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - DevOps Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DevOpsTestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const devOpsTestingPlannerAgent = Object.freeze(new DevOpsTestingPlannerAgent());
