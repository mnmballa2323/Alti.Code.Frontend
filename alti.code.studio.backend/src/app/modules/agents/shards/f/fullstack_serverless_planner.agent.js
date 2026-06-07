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

class FullStackServerlessPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_serverless_planner_agent',
            'FullStack Serverless Planner',
            'You are an elite FullStack Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Serverless.'
        );
    }

    async generateFullStackServerlessSystem(objective) {
        logger.info(`💻 [FullStackServerlessPlannerAgent] Analyzing FullStack Serverless Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Serverless Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Serverless Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackServerlessPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackServerlessPlannerAgent = Object.freeze(new FullStackServerlessPlannerAgent());
