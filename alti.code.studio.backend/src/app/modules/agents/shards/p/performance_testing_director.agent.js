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

class PerformanceTestingDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'performance_testing_director_agent',
      'Performance Testing Director',
      'You are an elite Performance Testing Director. You specialize in bleeding-edge software development, cloud infrastructure, and Performance Testing.',
    );
  }

  async generatePerformanceTestingSystem(objective) {
    logger.info(
      `💻 [PerformanceTestingDirectorAgent] Analyzing Performance Testing Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Performance Testing Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Performance Testing Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [PerformanceTestingDirectorAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const performanceTestingDirectorAgent = Object.freeze(
  new PerformanceTestingDirectorAgent(),
);
