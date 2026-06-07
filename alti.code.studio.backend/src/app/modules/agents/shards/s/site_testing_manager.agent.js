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

class SiteTestingManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_testing_manager_agent',
            'Site Testing Manager',
            'You are an elite Site Testing Manager. You specialize in bleeding-edge software development, cloud infrastructure, and Site Testing.'
        );
    }

    async generateSiteTestingSystem(objective) {
        logger.info(`💻 [SiteTestingManagerAgent] Analyzing Site Testing Manager specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Testing Manager.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Testing Manager Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteTestingManagerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteTestingManagerAgent = Object.freeze(new SiteTestingManagerAgent());
