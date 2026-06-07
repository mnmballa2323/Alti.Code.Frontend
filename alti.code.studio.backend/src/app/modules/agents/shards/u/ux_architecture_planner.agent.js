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

class UXArchitecturePlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ux_architecture_planner_agent',
            'UX Architecture Planner',
            'You are an elite UX Architecture Planner. You specialize in bleeding-edge software development, cloud infrastructure, and UX Architecture.'
        );
    }

    async generateUXArchitectureSystem(objective) {
        logger.info(`💻 [UXArchitecturePlannerAgent] Analyzing UX Architecture Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UX Architecture Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - UX Architecture Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [UXArchitecturePlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const uXArchitecturePlannerAgent = Object.freeze(new UXArchitecturePlannerAgent());
