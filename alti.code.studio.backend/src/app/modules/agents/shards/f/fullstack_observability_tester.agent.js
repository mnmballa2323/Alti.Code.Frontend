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

class FullStackObservabilityTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_observability_tester_agent',
            'FullStack Observability Tester',
            'You are an elite FullStack Observability Tester. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Observability.'
        );
    }

    async generateFullStackObservabilitySystem(objective) {
        logger.info(`💻 [FullStackObservabilityTesterAgent] Analyzing FullStack Observability Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Observability Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Observability Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackObservabilityTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackObservabilityTesterAgent = Object.freeze(new FullStackObservabilityTesterAgent());
