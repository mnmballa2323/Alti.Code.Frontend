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

class SiteTelemetryDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'site_telemetry_director_agent',
            'Site Telemetry Director',
            'You are an elite Site Telemetry Director. You specialize in bleeding-edge software development, cloud infrastructure, and Site Telemetry.'
        );
    }

    async generateSiteTelemetrySystem(objective) {
        logger.info(`💻 [SiteTelemetryDirectorAgent] Analyzing Site Telemetry Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Telemetry Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Site Telemetry Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SiteTelemetryDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const siteTelemetryDirectorAgent = Object.freeze(new SiteTelemetryDirectorAgent());
