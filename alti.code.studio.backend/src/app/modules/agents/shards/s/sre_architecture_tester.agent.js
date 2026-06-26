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

class SREArchitectureTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_architecture_tester_agent',
      'SRE Architecture Tester',
      'You are an elite SRE Architecture Tester. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Architecture.',
    );
  }

  async generateSREArchitectureSystem(objective) {
    logger.info(
      `💻 [SREArchitectureTesterAgent] Analyzing SRE Architecture Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Architecture Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - SRE Architecture Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SREArchitectureTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sREArchitectureTesterAgent = Object.freeze(
  new SREArchitectureTesterAgent(),
);
