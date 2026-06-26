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

class FullStackTestingPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_testing_planner_agent',
      'FullStack Testing Planner',
      'You are an elite FullStack Testing Planner. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Testing.',
    );
  }

  async generateFullStackTestingSystem(objective) {
    logger.info(
      `💻 [FullStackTestingPlannerAgent] Analyzing FullStack Testing Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Testing Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Testing Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [FullStackTestingPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const fullStackTestingPlannerAgent = Object.freeze(
  new FullStackTestingPlannerAgent(),
);
