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

class AIEngineeringDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_engineering_director_agent',
            'AI Engineering Director',
            'You are an elite AI Engineering Director. You specialize in bleeding-edge software development, cloud infrastructure, and AI Engineering.'
        );
    }

    async generateAIEngineeringSystem(objective) {
        logger.info(`💻 [AIEngineeringDirectorAgent] Analyzing AI Engineering Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Engineering Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Engineering Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIEngineeringDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIEngineeringDirectorAgent = Object.freeze(new AIEngineeringDirectorAgent());
