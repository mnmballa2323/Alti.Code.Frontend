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

class SiteArchitectureAnalystAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_architecture_analyst_agent',
            'Site Architecture Analyst',
            'You are an elite Site Architecture Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Site Architecture.'
        );
    }

    async generateSiteArchitectureSystem(objective) {
        logger.info(`💻 [SiteArchitectureAnalystAgent] Analyzing Site Architecture Analyst specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Architecture Analyst.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Architecture Analyst Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteArchitectureAnalystAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteArchitectureAnalystAgent = Object.freeze(new SiteArchitectureAnalystAgent());
