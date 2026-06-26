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

class FullStackMicroservicesAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_microservices_analyst_agent',
      'FullStack Microservices Analyst',
      'You are an elite FullStack Microservices Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Microservices.',
    );
  }

  async generateFullStackMicroservicesSystem(objective) {
    logger.info(
      `💻 [FullStackMicroservicesAnalystAgent] Analyzing FullStack Microservices Analyst specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Microservices Analyst.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Microservices Analyst Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackMicroservicesAnalystAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackMicroservicesAnalystAgent = Object.freeze(
  new FullStackMicroservicesAnalystAgent(),
);
