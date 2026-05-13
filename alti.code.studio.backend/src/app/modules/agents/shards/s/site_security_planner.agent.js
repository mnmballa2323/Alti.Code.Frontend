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

class SiteSecurityPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_security_planner_agent',
            'Site Security Planner',
            'You are an elite Site Security Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Security.'
        );
    }

    async generateSiteSecuritySystem(objective) {
        logger.info(`💻 [SiteSecurityPlannerAgent] Analyzing Site Security Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Security Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Security Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteSecurityPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteSecurityPlannerAgent = Object.freeze(new SiteSecurityPlannerAgent());
