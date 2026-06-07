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

class SiteArchitectureLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_architecture_lead_agent',
            'Site Architecture Lead',
            'You are an elite Site Architecture Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Site Architecture.'
        );
    }

    async generateSiteArchitectureSystem(objective) {
        logger.info(`💻 [SiteArchitectureLeadAgent] Analyzing Site Architecture Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Architecture Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Architecture Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteArchitectureLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteArchitectureLeadAgent = Object.freeze(new SiteArchitectureLeadAgent());
