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

class AITestingTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_testing_tester_agent',
      'AI Testing Tester',
      'You are an elite AI Testing Tester. You specialize in bleeding-edge software development, cloud infrastructure, and AI Testing.',
    );
  }

  async generateAITestingSystem(objective) {
    logger.info(
      `💻 [AITestingTesterAgent] Analyzing AI Testing Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Testing Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Testing Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AITestingTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aITestingTesterAgent = Object.freeze(new AITestingTesterAgent());
