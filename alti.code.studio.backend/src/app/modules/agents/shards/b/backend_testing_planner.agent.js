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

class BackendTestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_testing_planner_agent',
            'Backend Testing Planner',
            'You are an elite Backend Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Testing.'
        );
    }

    async generateBackendTestingSystem(objective) {
        logger.info(`💻 [BackendTestingPlannerAgent] Analyzing Backend Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendTestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendTestingPlannerAgent = Object.freeze(new BackendTestingPlannerAgent());
