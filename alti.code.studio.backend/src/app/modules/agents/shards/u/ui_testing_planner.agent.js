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

class UITestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ui_testing_planner_agent',
            'UI Testing Planner',
            'You are an elite UI Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and UI Testing.'
        );
    }

    async generateUITestingSystem(objective) {
        logger.info(`💻 [UITestingPlannerAgent] Analyzing UI Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - UI Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [UITestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const uITestingPlannerAgent = Object.freeze(new UITestingPlannerAgent());
