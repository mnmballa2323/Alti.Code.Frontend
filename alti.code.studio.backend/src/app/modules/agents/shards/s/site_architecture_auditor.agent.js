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

class SiteArchitectureAuditorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_architecture_auditor_agent',
            'Site Architecture Auditor',
            'You are an elite Site Architecture Auditor. You specialize in bleeding-edge software development, cloud infrastructure, and Site Architecture.'
        );
    }

    async generateSiteArchitectureSystem(objective) {
        logger.info(`💻 [SiteArchitectureAuditorAgent] Analyzing Site Architecture Auditor specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Architecture Auditor.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Architecture Auditor Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteArchitectureAuditorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteArchitectureAuditorAgent = Object.freeze(new SiteArchitectureAuditorAgent());
