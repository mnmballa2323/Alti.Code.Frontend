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

class AIMicroservicesPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_microservices_planner_agent',
      'AI Microservices Planner',
      'You are an elite AI Microservices Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Microservices.',
    );
  }

  async generateAIMicroservicesSystem(objective) {
    logger.info(
      `💻 [AIMicroservicesPlannerAgent] Analyzing AI Microservices Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Microservices Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Microservices Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIMicroservicesPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIMicroservicesPlannerAgent = Object.freeze(
  new AIMicroservicesPlannerAgent(),
);
