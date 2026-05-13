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

class DataTestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'data_testing_planner_agent',
            'Data Testing Planner',
            'You are an elite Data Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Data Testing.'
        );
    }

    async generateDataTestingSystem(objective) {
        logger.info(`💻 [DataTestingPlannerAgent] Analyzing Data Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Data Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Data Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DataTestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const dataTestingPlannerAgent = Object.freeze(new DataTestingPlannerAgent());
