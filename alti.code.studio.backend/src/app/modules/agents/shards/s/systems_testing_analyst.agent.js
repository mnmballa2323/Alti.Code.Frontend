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

class SystemsTestingAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_testing_analyst_agent',
      'Systems Testing Analyst',
      'You are an elite Systems Testing Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Testing.',
    );
  }

  async generateSystemsTestingSystem(objective) {
    logger.info(
      `💻 [SystemsTestingAnalystAgent] Analyzing Systems Testing Analyst specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Testing Analyst.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Testing Analyst Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SystemsTestingAnalystAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const systemsTestingAnalystAgent = Object.freeze(
  new SystemsTestingAnalystAgent(),
);
