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

class SystemsMicroservicesAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_microservices_analyst_agent',
      'Systems Microservices Analyst',
      'You are an elite Systems Microservices Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Microservices.',
    );
  }

  async generateSystemsMicroservicesSystem(objective) {
    logger.info(
      `💻 [SystemsMicroservicesAnalystAgent] Analyzing Systems Microservices Analyst specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Microservices Analyst.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Microservices Analyst Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [SystemsMicroservicesAnalystAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const systemsMicroservicesAnalystAgent = Object.freeze(
  new SystemsMicroservicesAnalystAgent(),
);
