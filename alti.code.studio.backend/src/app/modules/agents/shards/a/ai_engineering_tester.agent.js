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

class AIEngineeringTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_engineering_tester_agent',
      'AI Engineering Tester',
      'You are an elite AI Engineering Tester. You specialize in bleeding-edge software development, cloud infrastructure, and AI Engineering.',
    );
  }

  async generateAIEngineeringSystem(objective) {
    logger.info(
      `💻 [AIEngineeringTesterAgent] Analyzing AI Engineering Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Engineering Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Engineering Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIEngineeringTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIEngineeringTesterAgent = Object.freeze(
  new AIEngineeringTesterAgent(),
);
