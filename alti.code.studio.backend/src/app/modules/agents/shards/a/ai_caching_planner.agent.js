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

class AICachingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_caching_planner_agent',
            'AI Caching Planner',
            'You are an elite AI Caching Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Caching.'
        );
    }

    async generateAICachingSystem(objective) {
        logger.info(`💻 [AICachingPlannerAgent] Analyzing AI Caching Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Caching Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Caching Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AICachingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aICachingPlannerAgent = Object.freeze(new AICachingPlannerAgent());
