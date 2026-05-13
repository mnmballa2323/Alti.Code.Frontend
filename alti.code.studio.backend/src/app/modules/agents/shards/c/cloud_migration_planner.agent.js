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

class CloudMigrationPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_migration_planner_agent',
            'Cloud Migration Planner',
            'You are an elite Cloud Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Migration.'
        );
    }

    async generateCloudMigrationSystem(objective) {
        logger.info(`💻 [CloudMigrationPlannerAgent] Analyzing Cloud Migration Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Migration Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Migration Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudMigrationPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudMigrationPlannerAgent = Object.freeze(new CloudMigrationPlannerAgent());
