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

class SiteCompliancePlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_compliance_planner_agent',
      'Site Compliance Planner',
      'You are an elite Site Compliance Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Site Compliance.',
    );
  }

  async generateSiteComplianceSystem(objective) {
    logger.info(
      `💻 [SiteCompliancePlannerAgent] Analyzing Site Compliance Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Compliance Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Compliance Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteCompliancePlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteCompliancePlannerAgent = Object.freeze(
  new SiteCompliancePlannerAgent(),
);
