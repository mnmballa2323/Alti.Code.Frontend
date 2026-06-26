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

class DatabaseEngineeringPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'database_engineering_planner_agent',
      'Database Engineering Planner',
      'You are an elite Database Engineering Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Database Engineering.',
    );
  }

  async generateDatabaseEngineeringSystem(objective) {
    logger.info(
      `💻 [DatabaseEngineeringPlannerAgent] Analyzing Database Engineering Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Database Engineering Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Database Engineering Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DatabaseEngineeringPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const databaseEngineeringPlannerAgent = Object.freeze(
  new DatabaseEngineeringPlannerAgent(),
);
