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

class FullStackServerlessDeveloperAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_serverless_developer_agent',
            'FullStack Serverless Developer',
            'You are an elite FullStack Serverless Developer. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Serverless.'
        );
    }

    async generateFullStackServerlessSystem(objective) {
        logger.info(`💻 [FullStackServerlessDeveloperAgent] Analyzing FullStack Serverless Developer specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Serverless Developer.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Serverless Developer Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackServerlessDeveloperAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackServerlessDeveloperAgent = Object.freeze(new FullStackServerlessDeveloperAgent());
