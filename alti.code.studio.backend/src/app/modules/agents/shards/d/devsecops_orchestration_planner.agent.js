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

class DevSecOpsOrchestrationPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'devsecops_orchestration_planner_agent',
            'DevSecOps Orchestration Planner',
            'You are an elite DevSecOps Orchestration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Orchestration.'
        );
    }

    async generateDevSecOpsOrchestrationSystem(objective) {
        logger.info(`💻 [DevSecOpsOrchestrationPlannerAgent] Analyzing DevSecOps Orchestration Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Orchestration Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - DevSecOps Orchestration Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DevSecOpsOrchestrationPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const devSecOpsOrchestrationPlannerAgent = Object.freeze(new DevSecOpsOrchestrationPlannerAgent());
