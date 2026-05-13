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

class PerformanceTestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'performance_testing_planner_agent',
            'Performance Testing Planner',
            'You are an elite Performance Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Performance Testing.'
        );
    }

    async generatePerformanceTestingSystem(objective) {
        logger.info(`💻 [PerformanceTestingPlannerAgent] Analyzing Performance Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Performance Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Performance Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [PerformanceTestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const performanceTestingPlannerAgent = Object.freeze(new PerformanceTestingPlannerAgent());
