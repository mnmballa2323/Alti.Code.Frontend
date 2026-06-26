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

class SiteMicroservicesTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'site_microservices_tester_agent',
      'Site Microservices Tester',
      'You are an elite Site Microservices Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Site Microservices.',
    );
  }

  async generateSiteMicroservicesSystem(objective) {
    logger.info(
      `💻 [SiteMicroservicesTesterAgent] Analyzing Site Microservices Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Site Microservices Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Site Microservices Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SiteMicroservicesTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const siteMicroservicesTesterAgent = Object.freeze(
  new SiteMicroservicesTesterAgent(),
);
