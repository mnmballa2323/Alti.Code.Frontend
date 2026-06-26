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

class DevSecOpsContainerizationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devsecops_containerization_planner_agent',
      'DevSecOps Containerization Planner',
      'You are an elite DevSecOps Containerization Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Containerization.',
    );
  }

  async generateDevSecOpsContainerizationSystem(objective) {
    logger.info(
      `💻 [DevSecOpsContainerizationPlannerAgent] Analyzing DevSecOps Containerization Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Containerization Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevSecOps Containerization Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DevSecOpsContainerizationPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const devSecOpsContainerizationPlannerAgent = Object.freeze(
  new DevSecOpsContainerizationPlannerAgent(),
);
