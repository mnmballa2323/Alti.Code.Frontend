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

class DevOpsMicroservicesTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devops_microservices_tester_agent',
      'DevOps Microservices Tester',
      'You are an elite DevOps Microservices Tester. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Microservices.',
    );
  }

  async generateDevOpsMicroservicesSystem(objective) {
    logger.info(
      `💻 [DevOpsMicroservicesTesterAgent] Analyzing DevOps Microservices Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Microservices Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevOps Microservices Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DevOpsMicroservicesTesterAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const devOpsMicroservicesTesterAgent = Object.freeze(
  new DevOpsMicroservicesTesterAgent(),
);
