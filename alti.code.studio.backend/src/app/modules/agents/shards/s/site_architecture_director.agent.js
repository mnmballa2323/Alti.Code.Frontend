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

class SiteArchitectureDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_architecture_director_agent',
            'Site Architecture Director',
            'You are an elite Site Architecture Director. You specialize in bleeding-edge software development, cloud infrastructure, and Site Architecture.'
        );
    }

    async generateSiteArchitectureSystem(objective) {
        logger.info(`💻 [SiteArchitectureDirectorAgent] Analyzing Site Architecture Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Architecture Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Architecture Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteArchitectureDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteArchitectureDirectorAgent = Object.freeze(new SiteArchitectureDirectorAgent());
