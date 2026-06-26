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

class SiteContainerizationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_containerization_planner_agent',
      'Site Containerization Planner',
      'You are an elite Site Containerization Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Containerization.',
    );
  }

  async generateSiteContainerizationSystem(objective) {
    logger.info(
      `💻 [SiteContainerizationPlannerAgent] Analyzing Site Containerization Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Containerization Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Containerization Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [SiteContainerizationPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const siteContainerizationPlannerAgent = Object.freeze(
  new SiteContainerizationPlannerAgent(),
);
