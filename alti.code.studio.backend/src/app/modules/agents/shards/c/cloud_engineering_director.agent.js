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

class CloudEngineeringDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_engineering_director_agent',
      'Cloud Engineering Director',
      'You are an elite Cloud Engineering Director. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Engineering.',
    );
  }

  async generateCloudEngineeringSystem(objective) {
    logger.info(
      `💻 [CloudEngineeringDirectorAgent] Analyzing Cloud Engineering Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Engineering Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Engineering Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudEngineeringDirectorAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudEngineeringDirectorAgent = Object.freeze(
  new CloudEngineeringDirectorAgent(),
);
