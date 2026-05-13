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

class SiteServerlessAnalystAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_serverless_analyst_agent',
            'Site Serverless Analyst',
            'You are an elite Site Serverless Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Site Serverless.'
        );
    }

    async generateSiteServerlessSystem(objective) {
        logger.info(`💻 [SiteServerlessAnalystAgent] Analyzing Site Serverless Analyst specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Serverless Analyst.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Serverless Analyst Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteServerlessAnalystAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteServerlessAnalystAgent = Object.freeze(new SiteServerlessAnalystAgent());
