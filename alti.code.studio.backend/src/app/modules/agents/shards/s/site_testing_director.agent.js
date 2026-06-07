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

class SiteTestingDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_testing_director_agent',
            'Site Testing Director',
            'You are an elite Site Testing Director. You specialize in bleeding-edge software development, cloud infrastructure, and Site Testing.'
        );
    }

    async generateSiteTestingSystem(objective) {
        logger.info(`💻 [SiteTestingDirectorAgent] Analyzing Site Testing Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Testing Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Testing Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteTestingDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteTestingDirectorAgent = Object.freeze(new SiteTestingDirectorAgent());
