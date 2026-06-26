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

class DatabaseTestingPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'database_testing_planner_agent',
      'Database Testing Planner',
      'You are an elite Database Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Database Testing.',
    );
  }

  async generateDatabaseTestingSystem(objective) {
    logger.info(
      `💻 [DatabaseTestingPlannerAgent] Analyzing Database Testing Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Database Testing Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Database Testing Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DatabaseTestingPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const databaseTestingPlannerAgent = Object.freeze(
  new DatabaseTestingPlannerAgent(),
);
