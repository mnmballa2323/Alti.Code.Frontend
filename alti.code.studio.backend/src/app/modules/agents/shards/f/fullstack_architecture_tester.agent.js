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

class FullStackArchitectureTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_architecture_tester_agent',
      'FullStack Architecture Tester',
      'You are an elite FullStack Architecture Tester. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Architecture.',
    );
  }

  async generateFullStackArchitectureSystem(objective) {
    logger.info(
      `💻 [FullStackArchitectureTesterAgent] Analyzing FullStack Architecture Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Architecture Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Architecture Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackArchitectureTesterAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackArchitectureTesterAgent = Object.freeze(
  new FullStackArchitectureTesterAgent(),
);
