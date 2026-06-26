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

class SiteETLPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_etl_planner_agent',
      'Site ETL Planner',
      'You are an elite Site ETL Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site ETL.',
    );
  }

  async generateSiteETLSystem(objective) {
    logger.info(
      `💻 [SiteETLPlannerAgent] Analyzing Site ETL Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site ETL Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site ETL Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteETLPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteETLPlannerAgent = Object.freeze(new SiteETLPlannerAgent());
