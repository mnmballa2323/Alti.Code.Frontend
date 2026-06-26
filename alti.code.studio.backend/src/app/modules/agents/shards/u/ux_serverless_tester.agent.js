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

class UXServerlessTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ux_serverless_tester_agent',
      'UX Serverless Tester',
      'You are an elite UX Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and UX Serverless.',
    );
  }

  async generateUXServerlessSystem(objective) {
    logger.info(
      `💻 [UXServerlessTesterAgent] Analyzing UX Serverless Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UX Serverless Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - UX Serverless Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [UXServerlessTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const uXServerlessTesterAgent = Object.freeze(
  new UXServerlessTesterAgent(),
);
