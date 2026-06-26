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

class SiteCachingPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_caching_planner_agent',
      'Site Caching Planner',
      'You are an elite Site Caching Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Caching.',
    );
  }

  async generateSiteCachingSystem(objective) {
    logger.info(
      `💻 [SiteCachingPlannerAgent] Analyzing Site Caching Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Caching Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Caching Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteCachingPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteCachingPlannerAgent = Object.freeze(
  new SiteCachingPlannerAgent(),
);
