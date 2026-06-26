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

class FullStackTestingStrategistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_testing_strategist_agent',
      'FullStack Testing Strategist',
      'You are an elite FullStack Testing Strategist. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Testing.',
    );
  }

  async generateFullStackTestingSystem(objective) {
    logger.info(
      `💻 [FullStackTestingStrategistAgent] Analyzing FullStack Testing Strategist specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Testing Strategist.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Testing Strategist Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackTestingStrategistAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackTestingStrategistAgent = Object.freeze(
  new FullStackTestingStrategistAgent(),
);
