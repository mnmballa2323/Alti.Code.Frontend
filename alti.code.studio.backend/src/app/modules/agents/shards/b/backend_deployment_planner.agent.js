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

class BackendDeploymentPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_deployment_planner_agent',
            'Backend Deployment Planner',
            'You are an elite Backend Deployment Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Deployment.'
        );
    }

    async generateBackendDeploymentSystem(objective) {
        logger.info(`💻 [BackendDeploymentPlannerAgent] Analyzing Backend Deployment Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Deployment Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Deployment Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendDeploymentPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendDeploymentPlannerAgent = Object.freeze(new BackendDeploymentPlannerAgent());
