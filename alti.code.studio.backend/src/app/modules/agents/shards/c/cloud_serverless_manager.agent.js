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

class CloudServerlessManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_serverless_manager_agent',
      'Cloud Serverless Manager',
      'You are an elite Cloud Serverless Manager. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Serverless.',
    );
  }

  async generateCloudServerlessSystem(objective) {
    logger.info(
      `💻 [CloudServerlessManagerAgent] Analyzing Cloud Serverless Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Serverless Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Serverless Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudServerlessManagerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudServerlessManagerAgent = Object.freeze(
  new CloudServerlessManagerAgent(),
);
