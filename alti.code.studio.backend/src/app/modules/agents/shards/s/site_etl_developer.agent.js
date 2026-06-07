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

class SiteETLDeveloperAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_etl_developer_agent',
            'Site ETL Developer',
            'You are an elite Site ETL Developer. You specialize in bleeding-edge software development, cloud infrastructure, and Site ETL.'
        );
    }

    async generateSiteETLSystem(objective) {
        logger.info(`💻 [SiteETLDeveloperAgent] Analyzing Site ETL Developer specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site ETL Developer.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site ETL Developer Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteETLDeveloperAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteETLDeveloperAgent = Object.freeze(new SiteETLDeveloperAgent());
