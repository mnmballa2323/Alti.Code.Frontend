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

class FullStackMicroservicesPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_microservices_planner_agent',
      'FullStack Microservices Planner',
      'You are an elite FullStack Microservices Planner. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Microservices.',
    );
  }

  async generateFullStackMicroservicesSystem(objective) {
    logger.info(
      `💻 [FullStackMicroservicesPlannerAgent] Analyzing FullStack Microservices Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Microservices Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Microservices Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackMicroservicesPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackMicroservicesPlannerAgent = Object.freeze(
  new FullStackMicroservicesPlannerAgent(),
);
