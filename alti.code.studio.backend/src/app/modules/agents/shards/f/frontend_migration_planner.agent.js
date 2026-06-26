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

class FrontendMigrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'frontend_migration_planner_agent',
      'Frontend Migration Planner',
      'You are an elite Frontend Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Frontend Migration.',
    );
  }

  async generateFrontendMigrationSystem(objective) {
    logger.info(
      `💻 [FrontendMigrationPlannerAgent] Analyzing Frontend Migration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Frontend Migration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Frontend Migration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [FrontendMigrationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const frontendMigrationPlannerAgent = Object.freeze(
  new FrontendMigrationPlannerAgent(),
);
