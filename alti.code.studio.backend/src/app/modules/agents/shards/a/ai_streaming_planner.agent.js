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

class AIStreamingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_streaming_planner_agent',
            'AI Streaming Planner',
            'You are an elite AI Streaming Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Streaming.'
        );
    }

    async generateAIStreamingSystem(objective) {
        logger.info(`💻 [AIStreamingPlannerAgent] Analyzing AI Streaming Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Streaming Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Streaming Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIStreamingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIStreamingPlannerAgent = Object.freeze(new AIStreamingPlannerAgent());
