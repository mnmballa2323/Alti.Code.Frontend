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

class SiteSecurityAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_security_analyst_agent',
      'Site Security Analyst',
      'You are an elite Site Security Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Site Security.',
    );
  }

  async generateSiteSecuritySystem(objective) {
    logger.info(
      `💻 [SiteSecurityAnalystAgent] Analyzing Site Security Analyst specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Security Analyst.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Security Analyst Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteSecurityAnalystAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteSecurityAnalystAgent = Object.freeze(
  new SiteSecurityAnalystAgent(),
);
