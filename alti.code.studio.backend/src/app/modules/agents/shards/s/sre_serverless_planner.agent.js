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

class SREServerlessPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'sre_serverless_planner_agent',
            'SRE Serverless Planner',
            'You are an elite SRE Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Serverless.'
        );
    }

    async generateSREServerlessSystem(objective) {
        logger.info(`💻 [SREServerlessPlannerAgent] Analyzing SRE Serverless Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Serverless Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - SRE Serverless Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SREServerlessPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const sREServerlessPlannerAgent = Object.freeze(new SREServerlessPlannerAgent());
