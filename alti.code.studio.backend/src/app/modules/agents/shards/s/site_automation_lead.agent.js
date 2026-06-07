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

class SiteAutomationLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_automation_lead_agent',
            'Site Automation Lead',
            'You are an elite Site Automation Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Site Automation.'
        );
    }

    async generateSiteAutomationSystem(objective) {
        logger.info(`💻 [SiteAutomationLeadAgent] Analyzing Site Automation Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Automation Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Automation Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteAutomationLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteAutomationLeadAgent = Object.freeze(new SiteAutomationLeadAgent());
