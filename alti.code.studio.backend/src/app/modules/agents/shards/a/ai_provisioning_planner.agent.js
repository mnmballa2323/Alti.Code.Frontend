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

class AIProvisioningPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_provisioning_planner_agent',
            'AI Provisioning Planner',
            'You are an elite AI Provisioning Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Provisioning.'
        );
    }

    async generateAIProvisioningSystem(objective) {
        logger.info(`💻 [AIProvisioningPlannerAgent] Analyzing AI Provisioning Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Provisioning Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Provisioning Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIProvisioningPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIProvisioningPlannerAgent = Object.freeze(new AIProvisioningPlannerAgent());
