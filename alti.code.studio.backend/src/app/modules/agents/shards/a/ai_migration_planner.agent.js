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

class AIMigrationPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ai_migration_planner_agent',
            'AI Migration Planner',
            'You are an elite AI Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Migration.'
        );
    }

    async generateAIMigrationSystem(objective) {
        logger.info(`💻 [AIMigrationPlannerAgent] Analyzing AI Migration Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Migration Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - AI Migration Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AIMigrationPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const aIMigrationPlannerAgent = Object.freeze(new AIMigrationPlannerAgent());
