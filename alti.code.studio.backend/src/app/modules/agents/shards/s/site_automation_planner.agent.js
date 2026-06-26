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

class SiteAutomationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_automation_planner_agent',
      'Site Automation Planner',
      'You are an elite Site Automation Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Automation.',
    );
  }

  async generateSiteAutomationSystem(objective) {
    logger.info(
      `💻 [SiteAutomationPlannerAgent] Analyzing Site Automation Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Automation Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Automation Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteAutomationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteAutomationPlannerAgent = Object.freeze(
  new SiteAutomationPlannerAgent(),
);
