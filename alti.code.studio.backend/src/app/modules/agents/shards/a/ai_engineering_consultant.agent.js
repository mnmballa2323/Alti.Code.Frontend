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

class AIEngineeringConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_engineering_consultant_agent',
            'AI Engineering Consultant',
            'You are an elite AI Engineering Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and AI Engineering.'
        );
    }

    async generateAIEngineeringSystem(objective) {
        logger.info(`💻 [AIEngineeringConsultantAgent] Analyzing AI Engineering Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Engineering Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Engineering Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIEngineeringConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIEngineeringConsultantAgent = Object.freeze(new AIEngineeringConsultantAgent());
