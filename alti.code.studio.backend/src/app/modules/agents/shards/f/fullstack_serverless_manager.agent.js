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

class FullStackServerlessManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_serverless_manager_agent',
      'FullStack Serverless Manager',
      'You are an elite FullStack Serverless Manager. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Serverless.',
    );
  }

  async generateFullStackServerlessSystem(objective) {
    logger.info(
      `💻 [FullStackServerlessManagerAgent] Analyzing FullStack Serverless Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Serverless Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Serverless Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackServerlessManagerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackServerlessManagerAgent = Object.freeze(
  new FullStackServerlessManagerAgent(),
);
