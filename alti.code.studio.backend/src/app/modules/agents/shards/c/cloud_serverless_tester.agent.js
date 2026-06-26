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

class CloudServerlessTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_serverless_tester_agent',
      'Cloud Serverless Tester',
      'You are an elite Cloud Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Serverless.',
    );
  }

  async generateCloudServerlessSystem(objective) {
    logger.info(
      `💻 [CloudServerlessTesterAgent] Analyzing Cloud Serverless Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Serverless Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Serverless Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudServerlessTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudServerlessTesterAgent = Object.freeze(
  new CloudServerlessTesterAgent(),
);
