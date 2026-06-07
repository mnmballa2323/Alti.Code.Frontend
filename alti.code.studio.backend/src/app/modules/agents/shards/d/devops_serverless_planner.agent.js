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

class DevOpsServerlessPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'devops_serverless_planner_agent',
            'DevOps Serverless Planner',
            'You are an elite DevOps Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Serverless.'
        );
    }

    async generateDevOpsServerlessSystem(objective) {
        logger.info(`💻 [DevOpsServerlessPlannerAgent] Analyzing DevOps Serverless Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Serverless Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - DevOps Serverless Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DevOpsServerlessPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const devOpsServerlessPlannerAgent = Object.freeze(new DevOpsServerlessPlannerAgent());
