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

class SiteServerlessConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_serverless_consultant_agent',
            'Site Serverless Consultant',
            'You are an elite Site Serverless Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and Site Serverless.'
        );
    }

    async generateSiteServerlessSystem(objective) {
        logger.info(`💻 [SiteServerlessConsultantAgent] Analyzing Site Serverless Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Serverless Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Serverless Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteServerlessConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteServerlessConsultantAgent = Object.freeze(new SiteServerlessConsultantAgent());
