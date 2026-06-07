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

class AIArchitectureLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_architecture_lead_agent',
            'AI Architecture Lead',
            'You are an elite AI Architecture Lead. You specialize in bleeding-edge software development, cloud infrastructure, and AI Architecture.'
        );
    }

    async generateAIArchitectureSystem(objective) {
        logger.info(`💻 [AIArchitectureLeadAgent] Analyzing AI Architecture Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Architecture Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Architecture Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIArchitectureLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIArchitectureLeadAgent = Object.freeze(new AIArchitectureLeadAgent());
