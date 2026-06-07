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

class SRETelemetryPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'sre_telemetry_planner_agent',
            'SRE Telemetry Planner',
            'You are an elite SRE Telemetry Planner. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Telemetry.'
        );
    }

    async generateSRETelemetrySystem(objective) {
        logger.info(`💻 [SRETelemetryPlannerAgent] Analyzing SRE Telemetry Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Telemetry Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - SRE Telemetry Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SRETelemetryPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const sRETelemetryPlannerAgent = Object.freeze(new SRETelemetryPlannerAgent());
