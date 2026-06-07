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

class SiteProvisioningDesignerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_provisioning_designer_agent',
            'Site Provisioning Designer',
            'You are an elite Site Provisioning Designer. You specialize in bleeding-edge software development, cloud infrastructure, and Site Provisioning.'
        );
    }

    async generateSiteProvisioningSystem(objective) {
        logger.info(`💻 [SiteProvisioningDesignerAgent] Analyzing Site Provisioning Designer specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Provisioning Designer.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Provisioning Designer Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteProvisioningDesignerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteProvisioningDesignerAgent = Object.freeze(new SiteProvisioningDesignerAgent());
