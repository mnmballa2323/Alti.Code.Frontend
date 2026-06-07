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

class SiteArchitectureEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_architecture_engineer_agent',
            'Site Architecture Engineer',
            'You are an elite Site Architecture Engineer. You specialize in bleeding-edge software development, cloud infrastructure, and Site Architecture.'
        );
    }

    async generateSiteArchitectureSystem(objective) {
        logger.info(`💻 [SiteArchitectureEngineerAgent] Analyzing Site Architecture Engineer specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Architecture Engineer.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Architecture Engineer Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteArchitectureEngineerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteArchitectureEngineerAgent = Object.freeze(new SiteArchitectureEngineerAgent());
