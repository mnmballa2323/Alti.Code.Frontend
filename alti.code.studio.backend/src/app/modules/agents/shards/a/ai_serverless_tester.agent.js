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

class AIServerlessTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_serverless_tester_agent',
            'AI Serverless Tester',
            'You are an elite AI Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and AI Serverless.'
        );
    }

    async generateAIServerlessSystem(objective) {
        logger.info(`💻 [AIServerlessTesterAgent] Analyzing AI Serverless Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Serverless Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Serverless Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIServerlessTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIServerlessTesterAgent = Object.freeze(new AIServerlessTesterAgent());
