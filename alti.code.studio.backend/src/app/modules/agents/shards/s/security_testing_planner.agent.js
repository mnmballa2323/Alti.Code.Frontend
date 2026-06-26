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

class SecurityTestingPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'security_testing_planner_agent',
      'Security Testing Planner',
      'You are an elite Security Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Security Testing.',
    );
  }

  async generateSecurityTestingSystem(objective) {
    logger.info(
      `💻 [SecurityTestingPlannerAgent] Analyzing Security Testing Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Security Testing Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Security Testing Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SecurityTestingPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const securityTestingPlannerAgent = Object.freeze(
  new SecurityTestingPlannerAgent(),
);
