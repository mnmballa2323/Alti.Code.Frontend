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

class FullStackIntegrationTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_integration_tester_agent',
            'FullStack Integration Tester',
            'You are an elite FullStack Integration Tester. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Integration.'
        );
    }

    async generateFullStackIntegrationSystem(objective) {
        logger.info(`💻 [FullStackIntegrationTesterAgent] Analyzing FullStack Integration Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Integration Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Integration Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackIntegrationTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackIntegrationTesterAgent = Object.freeze(new FullStackIntegrationTesterAgent());
