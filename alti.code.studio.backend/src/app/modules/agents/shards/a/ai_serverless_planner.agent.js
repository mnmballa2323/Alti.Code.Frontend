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

class AIServerlessPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_serverless_planner_agent',
            'AI Serverless Planner',
            'You are an elite AI Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Serverless.'
        );
    }

    async generateAIServerlessSystem(objective) {
        logger.info(`💻 [AIServerlessPlannerAgent] Analyzing AI Serverless Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Serverless Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Serverless Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIServerlessPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIServerlessPlannerAgent = Object.freeze(new AIServerlessPlannerAgent());
