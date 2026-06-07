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

class SiteServerlessPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_serverless_planner_agent',
            'Site Serverless Planner',
            'You are an elite Site Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Serverless.'
        );
    }

    async generateSiteServerlessSystem(objective) {
        logger.info(`💻 [SiteServerlessPlannerAgent] Analyzing Site Serverless Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Serverless Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Serverless Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteServerlessPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteServerlessPlannerAgent = Object.freeze(new SiteServerlessPlannerAgent());
