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

class AIArchitectureManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_architecture_manager_agent',
            'AI Architecture Manager',
            'You are an elite AI Architecture Manager. You specialize in bleeding-edge software development, cloud infrastructure, and AI Architecture.'
        );
    }

    async generateAIArchitectureSystem(objective) {
        logger.info(`💻 [AIArchitectureManagerAgent] Analyzing AI Architecture Manager specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Architecture Manager.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Architecture Manager Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIArchitectureManagerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIArchitectureManagerAgent = Object.freeze(new AIArchitectureManagerAgent());
