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

class DevSecOpsArchitecturePlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devsecops_architecture_planner_agent',
      'DevSecOps Architecture Planner',
      'You are an elite DevSecOps Architecture Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Architecture.',
    );
  }

  async generateDevSecOpsArchitectureSystem(objective) {
    logger.info(
      `💻 [DevSecOpsArchitecturePlannerAgent] Analyzing DevSecOps Architecture Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Architecture Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevSecOps Architecture Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DevSecOpsArchitecturePlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const devSecOpsArchitecturePlannerAgent = Object.freeze(
  new DevSecOpsArchitecturePlannerAgent(),
);
