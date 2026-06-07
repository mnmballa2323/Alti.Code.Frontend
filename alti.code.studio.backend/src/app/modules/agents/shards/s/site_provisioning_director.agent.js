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

class SiteProvisioningDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_provisioning_director_agent',
            'Site Provisioning Director',
            'You are an elite Site Provisioning Director. You specialize in bleeding-edge software development, cloud infrastructure, and Site Provisioning.'
        );
    }

    async generateSiteProvisioningSystem(objective) {
        logger.info(`💻 [SiteProvisioningDirectorAgent] Analyzing Site Provisioning Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Provisioning Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Provisioning Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteProvisioningDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteProvisioningDirectorAgent = Object.freeze(new SiteProvisioningDirectorAgent());
