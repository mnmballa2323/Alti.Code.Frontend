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

class DevOpsContainerizationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devops_containerization_planner_agent',
      'DevOps Containerization Planner',
      'You are an elite DevOps Containerization Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Containerization.',
    );
  }

  async generateDevOpsContainerizationSystem(objective) {
    logger.info(
      `💻 [DevOpsContainerizationPlannerAgent] Analyzing DevOps Containerization Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Containerization Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevOps Containerization Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DevOpsContainerizationPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const devOpsContainerizationPlannerAgent = Object.freeze(
  new DevOpsContainerizationPlannerAgent(),
);
