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

class SiteProvisioningManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_provisioning_manager_agent',
            'Site Provisioning Manager',
            'You are an elite Site Provisioning Manager. You specialize in bleeding-edge software development, cloud infrastructure, and Site Provisioning.'
        );
    }

    async generateSiteProvisioningSystem(objective) {
        logger.info(`💻 [SiteProvisioningManagerAgent] Analyzing Site Provisioning Manager specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Provisioning Manager.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Provisioning Manager Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteProvisioningManagerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteProvisioningManagerAgent = Object.freeze(new SiteProvisioningManagerAgent());
