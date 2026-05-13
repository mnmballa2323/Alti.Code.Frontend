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

class FullStackServerlessTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_serverless_tester_agent',
            'FullStack Serverless Tester',
            'You are an elite FullStack Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Serverless.'
        );
    }

    async generateFullStackServerlessSystem(objective) {
        logger.info(`💻 [FullStackServerlessTesterAgent] Analyzing FullStack Serverless Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Serverless Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Serverless Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackServerlessTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackServerlessTesterAgent = Object.freeze(new FullStackServerlessTesterAgent());
