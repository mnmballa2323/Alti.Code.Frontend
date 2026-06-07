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

class SiteETLTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_etl_tester_agent',
            'Site ETL Tester',
            'You are an elite Site ETL Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Site ETL.'
        );
    }

    async generateSiteETLSystem(objective) {
        logger.info(`💻 [SiteETLTesterAgent] Analyzing Site ETL Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site ETL Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site ETL Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteETLTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteETLTesterAgent = Object.freeze(new SiteETLTesterAgent());
