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

class SiteCachingTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_caching_tester_agent',
      'Site Caching Tester',
      'You are an elite Site Caching Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Site Caching.',
    );
  }

  async generateSiteCachingSystem(objective) {
    logger.info(
      `💻 [SiteCachingTesterAgent] Analyzing Site Caching Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Caching Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Caching Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteCachingTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteCachingTesterAgent = Object.freeze(
  new SiteCachingTesterAgent(),
);
