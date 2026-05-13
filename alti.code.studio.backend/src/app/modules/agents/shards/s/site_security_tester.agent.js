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

class SiteSecurityTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_security_tester_agent',
            'Site Security Tester',
            'You are an elite Site Security Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Site Security.'
        );
    }

    async generateSiteSecuritySystem(objective) {
        logger.info(`💻 [SiteSecurityTesterAgent] Analyzing Site Security Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Security Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Security Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteSecurityTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteSecurityTesterAgent = Object.freeze(new SiteSecurityTesterAgent());
