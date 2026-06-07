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

class SiteEngineeringArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_engineering_architect_agent',
            'Site Engineering Architect',
            'You are an elite Site Engineering Architect. You specialize in bleeding-edge software development, cloud infrastructure, and Site Engineering.'
        );
    }

    async generateSiteEngineeringSystem(objective) {
        logger.info(`💻 [SiteEngineeringArchitectAgent] Analyzing Site Engineering Architect specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Engineering Architect.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Engineering Architect Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteEngineeringArchitectAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteEngineeringArchitectAgent = Object.freeze(new SiteEngineeringArchitectAgent());
