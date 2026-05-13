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

class FullStackStreamingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_streaming_planner_agent',
            'FullStack Streaming Planner',
            'You are an elite FullStack Streaming Planner. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Streaming.'
        );
    }

    async generateFullStackStreamingSystem(objective) {
        logger.info(`💻 [FullStackStreamingPlannerAgent] Analyzing FullStack Streaming Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Streaming Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Streaming Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackStreamingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackStreamingPlannerAgent = Object.freeze(new FullStackStreamingPlannerAgent());
