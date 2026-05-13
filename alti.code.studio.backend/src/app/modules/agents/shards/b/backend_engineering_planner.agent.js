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

class BackendEngineeringPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_engineering_planner_agent',
            'Backend Engineering Planner',
            'You are an elite Backend Engineering Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Engineering.'
        );
    }

    async generateBackendEngineeringSystem(objective) {
        logger.info(`💻 [BackendEngineeringPlannerAgent] Analyzing Backend Engineering Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Engineering Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Engineering Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendEngineeringPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendEngineeringPlannerAgent = Object.freeze(new BackendEngineeringPlannerAgent());
