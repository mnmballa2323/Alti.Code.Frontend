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

class InfrastructureMigrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'infrastructure_migration_planner_agent',
      'Infrastructure Migration Planner',
      'You are an elite Infrastructure Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Migration.',
    );
  }

  async generateInfrastructureMigrationSystem(objective) {
    logger.info(
      `💻 [InfrastructureMigrationPlannerAgent] Analyzing Infrastructure Migration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Migration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Infrastructure Migration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [InfrastructureMigrationPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const infrastructureMigrationPlannerAgent = Object.freeze(
  new InfrastructureMigrationPlannerAgent(),
);
