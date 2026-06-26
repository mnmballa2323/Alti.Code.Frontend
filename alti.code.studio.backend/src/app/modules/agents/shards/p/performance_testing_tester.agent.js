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

class PerformanceTestingTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'performance_testing_tester_agent',
      'Performance Testing Tester',
      'You are an elite Performance Testing Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Performance Testing.',
    );
  }

  async generatePerformanceTestingSystem(objective) {
    logger.info(
      `💻 [PerformanceTestingTesterAgent] Analyzing Performance Testing Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Performance Testing Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Performance Testing Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [PerformanceTestingTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const performanceTestingTesterAgent = Object.freeze(
  new PerformanceTestingTesterAgent(),
);
