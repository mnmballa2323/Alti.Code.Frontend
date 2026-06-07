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

class AITestingOrchestratorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_testing_orchestrator_agent',
            'AI Testing Orchestrator',
            'You are an elite AI Testing Orchestrator. You specialize in bleeding-edge software development, cloud infrastructure, and AI Testing.'
        );
    }

    async generateAITestingSystem(objective) {
        logger.info(`💻 [AITestingOrchestratorAgent] Analyzing AI Testing Orchestrator specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Testing Orchestrator.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Testing Orchestrator Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AITestingOrchestratorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aITestingOrchestratorAgent = Object.freeze(new AITestingOrchestratorAgent());
