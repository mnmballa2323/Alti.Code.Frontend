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

class SiteEngineeringManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_engineering_manager_agent',
            'Site Engineering Manager',
            'You are an elite Site Engineering Manager. You specialize in bleeding-edge software development, cloud infrastructure, and Site Engineering.'
        );
    }

    async generateSiteEngineeringSystem(objective) {
        logger.info(`💻 [SiteEngineeringManagerAgent] Analyzing Site Engineering Manager specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Engineering Manager.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Engineering Manager Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteEngineeringManagerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteEngineeringManagerAgent = Object.freeze(new SiteEngineeringManagerAgent());
