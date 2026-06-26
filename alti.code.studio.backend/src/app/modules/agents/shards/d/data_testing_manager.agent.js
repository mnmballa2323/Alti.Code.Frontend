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

class DataTestingManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'data_testing_manager_agent',
      'Data Testing Manager',
      'You are an elite Data Testing Manager. You specialize in bleeding-edge software development, cloud infrastructure, and Data Testing.',
    );
  }

  async generateDataTestingSystem(objective) {
    logger.info(
      `💻 [DataTestingManagerAgent] Analyzing Data Testing Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Data Testing Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Data Testing Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DataTestingManagerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const dataTestingManagerAgent = Object.freeze(
  new DataTestingManagerAgent(),
);
