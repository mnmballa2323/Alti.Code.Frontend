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

class AIETLPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_etl_planner_agent',
            'AI ETL Planner',
            'You are an elite AI ETL Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI ETL.'
        );
    }

    async generateAIETLSystem(objective) {
        logger.info(`💻 [AIETLPlannerAgent] Analyzing AI ETL Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI ETL Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI ETL Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIETLPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIETLPlannerAgent = Object.freeze(new AIETLPlannerAgent());
