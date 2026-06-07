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

class EnterpriseTestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'enterprise_testing_planner_agent',
            'Enterprise Testing Planner',
            'You are an elite Enterprise Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Enterprise Testing.'
        );
    }

    async generateEnterpriseTestingSystem(objective) {
        logger.info(`💻 [EnterpriseTestingPlannerAgent] Analyzing Enterprise Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Enterprise Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Enterprise Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [EnterpriseTestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const enterpriseTestingPlannerAgent = Object.freeze(new EnterpriseTestingPlannerAgent());
