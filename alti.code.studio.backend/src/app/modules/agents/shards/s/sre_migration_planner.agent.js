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

class SREMigrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_migration_planner_agent',
      'SRE Migration Planner',
      'You are an elite SRE Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Migration.',
    );
  }

  async generateSREMigrationSystem(objective) {
    logger.info(
      `💻 [SREMigrationPlannerAgent] Analyzing SRE Migration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Migration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - SRE Migration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SREMigrationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sREMigrationPlannerAgent = Object.freeze(
  new SREMigrationPlannerAgent(),
);
