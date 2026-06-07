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

class FullStackAutomationTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_automation_tester_agent',
            'FullStack Automation Tester',
            'You are an elite FullStack Automation Tester. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Automation.'
        );
    }

    async generateFullStackAutomationSystem(objective) {
        logger.info(`💻 [FullStackAutomationTesterAgent] Analyzing FullStack Automation Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Automation Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Automation Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackAutomationTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackAutomationTesterAgent = Object.freeze(new FullStackAutomationTesterAgent());
