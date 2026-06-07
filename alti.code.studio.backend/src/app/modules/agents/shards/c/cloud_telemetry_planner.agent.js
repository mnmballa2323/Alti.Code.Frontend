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

class CloudTelemetryPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_telemetry_planner_agent',
            'Cloud Telemetry Planner',
            'You are an elite Cloud Telemetry Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Telemetry.'
        );
    }

    async generateCloudTelemetrySystem(objective) {
        logger.info(`💻 [CloudTelemetryPlannerAgent] Analyzing Cloud Telemetry Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Telemetry Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Telemetry Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudTelemetryPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudTelemetryPlannerAgent = Object.freeze(new CloudTelemetryPlannerAgent());
