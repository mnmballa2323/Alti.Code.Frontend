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

class InfrastructureArchitecturePlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'infrastructure_architecture_planner_agent',
            'Infrastructure Architecture Planner',
            'You are an elite Infrastructure Architecture Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Architecture.'
        );
    }

    async generateInfrastructureArchitectureSystem(objective) {
        logger.info(`💻 [InfrastructureArchitecturePlannerAgent] Analyzing Infrastructure Architecture Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Architecture Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Infrastructure Architecture Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [InfrastructureArchitecturePlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const infrastructureArchitecturePlannerAgent = Object.freeze(new InfrastructureArchitecturePlannerAgent());
