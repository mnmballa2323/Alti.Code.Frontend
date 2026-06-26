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

class SystemsTestingTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_testing_tester_agent',
      'Systems Testing Tester',
      'You are an elite Systems Testing Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Testing.',
    );
  }

  async generateSystemsTestingSystem(objective) {
    logger.info(
      `💻 [SystemsTestingTesterAgent] Analyzing Systems Testing Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Testing Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Testing Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SystemsTestingTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const systemsTestingTesterAgent = Object.freeze(
  new SystemsTestingTesterAgent(),
);
