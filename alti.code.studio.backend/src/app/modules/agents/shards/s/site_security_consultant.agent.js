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

class SiteSecurityConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_security_consultant_agent',
            'Site Security Consultant',
            'You are an elite Site Security Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and Site Security.'
        );
    }

    async generateSiteSecuritySystem(objective) {
        logger.info(`💻 [SiteSecurityConsultantAgent] Analyzing Site Security Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Security Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Security Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteSecurityConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteSecurityConsultantAgent = Object.freeze(new SiteSecurityConsultantAgent());
