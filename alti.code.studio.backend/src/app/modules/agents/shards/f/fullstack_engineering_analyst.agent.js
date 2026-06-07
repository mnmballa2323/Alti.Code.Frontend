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

class FullStackEngineeringAnalystAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_engineering_analyst_agent',
            'FullStack Engineering Analyst',
            'You are an elite FullStack Engineering Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Engineering.'
        );
    }

    async generateFullStackEngineeringSystem(objective) {
        logger.info(`💻 [FullStackEngineeringAnalystAgent] Analyzing FullStack Engineering Analyst specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Engineering Analyst.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Engineering Analyst Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackEngineeringAnalystAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackEngineeringAnalystAgent = Object.freeze(new FullStackEngineeringAnalystAgent());
