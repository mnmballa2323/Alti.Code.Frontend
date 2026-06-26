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

class CloudTestingDesignerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_testing_designer_agent',
      'Cloud Testing Designer',
      'You are an elite Cloud Testing Designer. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Testing.',
    );
  }

  async generateCloudTestingSystem(objective) {
    logger.info(
      `💻 [CloudTestingDesignerAgent] Analyzing Cloud Testing Designer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Testing Designer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Testing Designer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudTestingDesignerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudTestingDesignerAgent = Object.freeze(
  new CloudTestingDesignerAgent(),
);
