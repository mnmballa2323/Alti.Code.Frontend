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

class AIArchitectureDesignerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_architecture_designer_agent',
            'AI Architecture Designer',
            'You are an elite AI Architecture Designer. You specialize in bleeding-edge software development, cloud infrastructure, and AI Architecture.'
        );
    }

    async generateAIArchitectureSystem(objective) {
        logger.info(`💻 [AIArchitectureDesignerAgent] Analyzing AI Architecture Designer specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Architecture Designer.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Architecture Designer Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIArchitectureDesignerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIArchitectureDesignerAgent = Object.freeze(new AIArchitectureDesignerAgent());
