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

class SiteTelemetryLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_telemetry_lead_agent',
            'Site Telemetry Lead',
            'You are an elite Site Telemetry Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Site Telemetry.'
        );
    }

    async generateSiteTelemetrySystem(objective) {
        logger.info(`💻 [SiteTelemetryLeadAgent] Analyzing Site Telemetry Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Telemetry Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Telemetry Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteTelemetryLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteTelemetryLeadAgent = Object.freeze(new SiteTelemetryLeadAgent());
