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

class CloudSecurityTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_security_tester_agent',
      'Cloud Security Tester',
      'You are an elite Cloud Security Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Security.',
    );
  }

  async generateCloudSecuritySystem(objective) {
    logger.info(
      `💻 [CloudSecurityTesterAgent] Analyzing Cloud Security Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Security Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Security Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudSecurityTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudSecurityTesterAgent = Object.freeze(
  new CloudSecurityTesterAgent(),
);
