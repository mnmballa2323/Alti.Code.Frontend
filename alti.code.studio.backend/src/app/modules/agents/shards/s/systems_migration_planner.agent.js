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

class SystemsMigrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_migration_planner_agent',
      'Systems Migration Planner',
      'You are an elite Systems Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Migration.',
    );
  }

  async generateSystemsMigrationSystem(objective) {
    logger.info(
      `💻 [SystemsMigrationPlannerAgent] Analyzing Systems Migration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Migration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Migration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SystemsMigrationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const systemsMigrationPlannerAgent = Object.freeze(
  new SystemsMigrationPlannerAgent(),
);
