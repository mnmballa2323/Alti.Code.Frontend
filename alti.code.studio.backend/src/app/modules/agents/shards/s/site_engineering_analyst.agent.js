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

class SiteEngineeringAnalystAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_engineering_analyst_agent',
            'Site Engineering Analyst',
            'You are an elite Site Engineering Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Site Engineering.'
        );
    }

    async generateSiteEngineeringSystem(objective) {
        logger.info(`💻 [SiteEngineeringAnalystAgent] Analyzing Site Engineering Analyst specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Engineering Analyst.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Engineering Analyst Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteEngineeringAnalystAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteEngineeringAnalystAgent = Object.freeze(new SiteEngineeringAnalystAgent());
