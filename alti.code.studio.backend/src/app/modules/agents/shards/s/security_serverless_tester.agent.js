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

class SecurityServerlessTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'security_serverless_tester_agent',
      'Security Serverless Tester',
      'You are an elite Security Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Security Serverless.',
    );
  }

  async generateSecurityServerlessSystem(objective) {
    logger.info(
      `💻 [SecurityServerlessTesterAgent] Analyzing Security Serverless Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Security Serverless Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Security Serverless Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SecurityServerlessTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const securityServerlessTesterAgent = Object.freeze(
  new SecurityServerlessTesterAgent(),
);
