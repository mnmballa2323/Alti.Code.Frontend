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

class FullStackObservabilityPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_observability_planner_agent',
            'FullStack Observability Planner',
            'You are an elite FullStack Observability Planner. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Observability.'
        );
    }

    async generateFullStackObservabilitySystem(objective) {
        logger.info(`💻 [FullStackObservabilityPlannerAgent] Analyzing FullStack Observability Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Observability Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Observability Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackObservabilityPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackObservabilityPlannerAgent = Object.freeze(new FullStackObservabilityPlannerAgent());
