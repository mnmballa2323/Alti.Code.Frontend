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

class SiteDeploymentEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_deployment_engineer_agent',
            'Site Deployment Engineer',
            'You are an elite Site Deployment Engineer. You specialize in bleeding-edge software development, cloud infrastructure, and Site Deployment.'
        );
    }

    async generateSiteDeploymentSystem(objective) {
        logger.info(`💻 [SiteDeploymentEngineerAgent] Analyzing Site Deployment Engineer specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Deployment Engineer.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Deployment Engineer Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteDeploymentEngineerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteDeploymentEngineerAgent = Object.freeze(new SiteDeploymentEngineerAgent());
