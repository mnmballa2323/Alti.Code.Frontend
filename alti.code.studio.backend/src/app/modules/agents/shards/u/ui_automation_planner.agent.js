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

class UIAutomationPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ui_automation_planner_agent',
            'UI Automation Planner',
            'You are an elite UI Automation Planner. You specialize in bleeding-edge software development, cloud infrastructure, and UI Automation.'
        );
    }

    async generateUIAutomationSystem(objective) {
        logger.info(`💻 [UIAutomationPlannerAgent] Analyzing UI Automation Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Automation Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - UI Automation Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [UIAutomationPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const uIAutomationPlannerAgent = Object.freeze(new UIAutomationPlannerAgent());
