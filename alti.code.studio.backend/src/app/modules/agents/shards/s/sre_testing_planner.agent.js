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

class SRETestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'sre_testing_planner_agent',
            'SRE Testing Planner',
            'You are an elite SRE Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Testing.'
        );
    }

    async generateSRETestingSystem(objective) {
        logger.info(`💻 [SRETestingPlannerAgent] Analyzing SRE Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - SRE Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SRETestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const sRETestingPlannerAgent = Object.freeze(new SRETestingPlannerAgent());
