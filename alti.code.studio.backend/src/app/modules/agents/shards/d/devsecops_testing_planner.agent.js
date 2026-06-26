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

class DevSecOpsTestingPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devsecops_testing_planner_agent',
      'DevSecOps Testing Planner',
      'You are an elite DevSecOps Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Testing.',
    );
  }

  async generateDevSecOpsTestingSystem(objective) {
    logger.info(
      `💻 [DevSecOpsTestingPlannerAgent] Analyzing DevSecOps Testing Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Testing Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevSecOps Testing Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DevSecOpsTestingPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const devSecOpsTestingPlannerAgent = Object.freeze(
  new DevSecOpsTestingPlannerAgent(),
);
