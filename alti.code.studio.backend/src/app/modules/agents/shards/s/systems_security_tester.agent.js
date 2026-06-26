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

class SystemsSecurityTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_security_tester_agent',
      'Systems Security Tester',
      'You are an elite Systems Security Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Security.',
    );
  }

  async generateSystemsSecuritySystem(objective) {
    logger.info(
      `💻 [SystemsSecurityTesterAgent] Analyzing Systems Security Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Security Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Security Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SystemsSecurityTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const systemsSecurityTesterAgent = Object.freeze(
  new SystemsSecurityTesterAgent(),
);
