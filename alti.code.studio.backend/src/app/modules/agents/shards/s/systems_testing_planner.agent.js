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

class SystemsTestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'systems_testing_planner_agent',
            'Systems Testing Planner',
            'You are an elite Systems Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Testing.'
        );
    }

    async generateSystemsTestingSystem(objective) {
        logger.info(`💻 [SystemsTestingPlannerAgent] Analyzing Systems Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Systems Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SystemsTestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const systemsTestingPlannerAgent = Object.freeze(new SystemsTestingPlannerAgent());
