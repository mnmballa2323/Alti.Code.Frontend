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

class AIAutomationPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_automation_planner_agent',
            'AI Automation Planner',
            'You are an elite AI Automation Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Automation.'
        );
    }

    async generateAIAutomationSystem(objective) {
        logger.info(`💻 [AIAutomationPlannerAgent] Analyzing AI Automation Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Automation Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Automation Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIAutomationPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIAutomationPlannerAgent = Object.freeze(new AIAutomationPlannerAgent());
