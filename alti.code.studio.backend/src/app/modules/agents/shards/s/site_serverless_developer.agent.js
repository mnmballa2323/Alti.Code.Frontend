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

class SiteServerlessDeveloperAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_serverless_developer_agent',
      'Site Serverless Developer',
      'You are an elite Site Serverless Developer. You specialize in bleeding-edge software development, cloud infrastructure, and Site Serverless.',
    );
  }

  async generateSiteServerlessSystem(objective) {
    logger.info(
      `💻 [SiteServerlessDeveloperAgent] Analyzing Site Serverless Developer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Serverless Developer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Serverless Developer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteServerlessDeveloperAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteServerlessDeveloperAgent = Object.freeze(
  new SiteServerlessDeveloperAgent(),
);
