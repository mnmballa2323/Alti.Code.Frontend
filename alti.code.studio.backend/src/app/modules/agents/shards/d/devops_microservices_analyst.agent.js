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

class DevOpsMicroservicesAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devops_microservices_analyst_agent',
      'DevOps Microservices Analyst',
      'You are an elite DevOps Microservices Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Microservices.',
    );
  }

  async generateDevOpsMicroservicesSystem(objective) {
    logger.info(
      `💻 [DevOpsMicroservicesAnalystAgent] Analyzing DevOps Microservices Analyst specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Microservices Analyst.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevOps Microservices Analyst Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DevOpsMicroservicesAnalystAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const devOpsMicroservicesAnalystAgent = Object.freeze(
  new DevOpsMicroservicesAnalystAgent(),
);
