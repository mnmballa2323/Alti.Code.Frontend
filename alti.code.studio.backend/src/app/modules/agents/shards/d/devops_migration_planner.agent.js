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

class DevOpsMigrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devops_migration_planner_agent',
      'DevOps Migration Planner',
      'You are an elite DevOps Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Migration.',
    );
  }

  async generateDevOpsMigrationSystem(objective) {
    logger.info(
      `💻 [DevOpsMigrationPlannerAgent] Analyzing DevOps Migration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Migration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevOps Migration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DevOpsMigrationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const devOpsMigrationPlannerAgent = Object.freeze(
  new DevOpsMigrationPlannerAgent(),
);
