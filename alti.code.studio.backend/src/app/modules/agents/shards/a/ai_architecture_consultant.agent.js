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

class AIArchitectureConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_architecture_consultant_agent',
            'AI Architecture Consultant',
            'You are an elite AI Architecture Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and AI Architecture.'
        );
    }

    async generateAIArchitectureSystem(objective) {
        logger.info(`💻 [AIArchitectureConsultantAgent] Analyzing AI Architecture Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Architecture Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Architecture Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIArchitectureConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIArchitectureConsultantAgent = Object.freeze(new AIArchitectureConsultantAgent());
