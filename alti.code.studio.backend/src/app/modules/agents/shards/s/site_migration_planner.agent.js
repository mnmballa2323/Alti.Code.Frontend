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

class SiteMigrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_migration_planner_agent',
      'Site Migration Planner',
      'You are an elite Site Migration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Migration.',
    );
  }

  async generateSiteMigrationSystem(objective) {
    logger.info(
      `💻 [SiteMigrationPlannerAgent] Analyzing Site Migration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Migration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Migration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteMigrationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteMigrationPlannerAgent = Object.freeze(
  new SiteMigrationPlannerAgent(),
);
