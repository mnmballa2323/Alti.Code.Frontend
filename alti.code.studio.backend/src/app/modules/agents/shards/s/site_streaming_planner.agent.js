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

class SiteStreamingPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_streaming_planner_agent',
            'Site Streaming Planner',
            'You are an elite Site Streaming Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Streaming.'
        );
    }

    async generateSiteStreamingSystem(objective) {
        logger.info(`💻 [SiteStreamingPlannerAgent] Analyzing Site Streaming Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Streaming Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Streaming Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteStreamingPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteStreamingPlannerAgent = Object.freeze(new SiteStreamingPlannerAgent());
