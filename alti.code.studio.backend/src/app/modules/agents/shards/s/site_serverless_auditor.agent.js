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

class SiteServerlessAuditorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_serverless_auditor_agent',
      'Site Serverless Auditor',
      'You are an elite Site Serverless Auditor. You specialize in bleeding-edge software development, cloud infrastructure, and Site Serverless.',
    );
  }

  async generateSiteServerlessSystem(objective) {
    logger.info(
      `💻 [SiteServerlessAuditorAgent] Analyzing Site Serverless Auditor specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Serverless Auditor.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Serverless Auditor Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteServerlessAuditorAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteServerlessAuditorAgent = Object.freeze(
  new SiteServerlessAuditorAgent(),
);
