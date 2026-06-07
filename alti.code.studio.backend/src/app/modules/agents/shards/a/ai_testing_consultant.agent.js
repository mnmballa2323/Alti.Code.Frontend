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

class AITestingConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_testing_consultant_agent',
            'AI Testing Consultant',
            'You are an elite AI Testing Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and AI Testing.'
        );
    }

    async generateAITestingSystem(objective) {
        logger.info(`💻 [AITestingConsultantAgent] Analyzing AI Testing Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Testing Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Testing Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AITestingConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aITestingConsultantAgent = Object.freeze(new AITestingConsultantAgent());
