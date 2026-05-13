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

class SiteObservabilityPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_observability_planner_agent',
            'Site Observability Planner',
            'You are an elite Site Observability Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Observability.'
        );
    }

    async generateSiteObservabilitySystem(objective) {
        logger.info(`💻 [SiteObservabilityPlannerAgent] Analyzing Site Observability Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Observability Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Observability Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteObservabilityPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteObservabilityPlannerAgent = Object.freeze(new SiteObservabilityPlannerAgent());
