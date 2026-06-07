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

class FullStackMigrationPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fullstack_migration_planner_agent',
            'FullStack Migration Planner',
            'You are an elite FullStack Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Migration.'
        );
    }

    async generateFullStackMigrationSystem(objective) {
        logger.info(`💻 [FullStackMigrationPlannerAgent] Analyzing FullStack Migration Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Migration Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - FullStack Migration Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FullStackMigrationPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const fullStackMigrationPlannerAgent = Object.freeze(new FullStackMigrationPlannerAgent());
