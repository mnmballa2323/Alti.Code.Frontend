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

class SiteProvisioningAnalystAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_provisioning_analyst_agent',
            'Site Provisioning Analyst',
            'You are an elite Site Provisioning Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Site Provisioning.'
        );
    }

    async generateSiteProvisioningSystem(objective) {
        logger.info(`💻 [SiteProvisioningAnalystAgent] Analyzing Site Provisioning Analyst specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Provisioning Analyst.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Provisioning Analyst Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteProvisioningAnalystAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteProvisioningAnalystAgent = Object.freeze(new SiteProvisioningAnalystAgent());
