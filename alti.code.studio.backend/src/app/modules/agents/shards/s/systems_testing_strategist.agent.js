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

class SystemsTestingStrategistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_testing_strategist_agent',
      'Systems Testing Strategist',
      'You are an elite Systems Testing Strategist. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Testing.',
    );
  }

  async generateSystemsTestingSystem(objective) {
    logger.info(
      `💻 [SystemsTestingStrategistAgent] Analyzing Systems Testing Strategist specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Testing Strategist.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Testing Strategist Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SystemsTestingStrategistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const systemsTestingStrategistAgent = Object.freeze(
  new SystemsTestingStrategistAgent(),
);
