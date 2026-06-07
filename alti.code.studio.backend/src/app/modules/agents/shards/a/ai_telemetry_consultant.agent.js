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

class AITelemetryConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_telemetry_consultant_agent',
            'AI Telemetry Consultant',
            'You are an elite AI Telemetry Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and AI Telemetry.'
        );
    }

    async generateAITelemetrySystem(objective) {
        logger.info(`💻 [AITelemetryConsultantAgent] Analyzing AI Telemetry Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Telemetry Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Telemetry Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AITelemetryConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aITelemetryConsultantAgent = Object.freeze(new AITelemetryConsultantAgent());
