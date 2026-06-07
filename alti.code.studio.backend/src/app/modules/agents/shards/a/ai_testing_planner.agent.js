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

class AITestingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_testing_planner_agent',
            'AI Testing Planner',
            'You are an elite AI Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Testing.'
        );
    }

    async generateAITestingSystem(objective) {
        logger.info(`💻 [AITestingPlannerAgent] Analyzing AI Testing Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Testing Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Testing Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AITestingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aITestingPlannerAgent = Object.freeze(new AITestingPlannerAgent());
