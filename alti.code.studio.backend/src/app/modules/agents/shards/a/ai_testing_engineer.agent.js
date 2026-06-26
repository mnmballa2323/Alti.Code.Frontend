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

class AITestingEngineerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_testing_engineer_agent',
      'AI Testing Engineer',
      'You are an elite AI Testing Engineer. You specialize in bleeding-edge software development, cloud infrastructure, and AI Testing.',
    );
  }

  async generateAITestingSystem(objective) {
    logger.info(
      `💻 [AITestingEngineerAgent] Analyzing AI Testing Engineer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Testing Engineer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Testing Engineer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AITestingEngineerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aITestingEngineerAgent = Object.freeze(
  new AITestingEngineerAgent(),
);
