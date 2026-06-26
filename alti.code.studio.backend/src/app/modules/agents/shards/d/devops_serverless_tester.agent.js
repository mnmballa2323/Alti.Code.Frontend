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

class DevOpsServerlessTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devops_serverless_tester_agent',
      'DevOps Serverless Tester',
      'You are an elite DevOps Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Serverless.',
    );
  }

  async generateDevOpsServerlessSystem(objective) {
    logger.info(
      `💻 [DevOpsServerlessTesterAgent] Analyzing DevOps Serverless Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Serverless Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevOps Serverless Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DevOpsServerlessTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const devOpsServerlessTesterAgent = Object.freeze(
  new DevOpsServerlessTesterAgent(),
);
