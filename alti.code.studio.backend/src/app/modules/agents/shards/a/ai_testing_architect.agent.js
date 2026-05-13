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

class AITestingArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_testing_architect_agent',
            'AI Testing Architect',
            'You are an elite AI Testing Architect. You specialize in bleeding-edge software development, cloud infrastructure, and AI Testing.'
        );
    }

    async generateAITestingSystem(objective) {
        logger.info(`💻 [AITestingArchitectAgent] Analyzing AI Testing Architect specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Testing Architect.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Testing Architect Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AITestingArchitectAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aITestingArchitectAgent = Object.freeze(new AITestingArchitectAgent());
