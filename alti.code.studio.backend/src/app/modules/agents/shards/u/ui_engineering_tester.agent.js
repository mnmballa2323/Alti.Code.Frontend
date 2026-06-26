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

class UIEngineeringTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ui_engineering_tester_agent',
      'UI Engineering Tester',
      'You are an elite UI Engineering Tester. You specialize in bleeding-edge software development, cloud infrastructure, and UI Engineering.',
    );
  }

  async generateUIEngineeringSystem(objective) {
    logger.info(
      `💻 [UIEngineeringTesterAgent] Analyzing UI Engineering Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Engineering Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - UI Engineering Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [UIEngineeringTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const uIEngineeringTesterAgent = Object.freeze(
  new UIEngineeringTesterAgent(),
);
