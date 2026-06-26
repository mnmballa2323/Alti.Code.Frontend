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

class GeminiCoderAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'gemini_coder',
      'Senior Software Engineer (Zero-to-One)',
      'You are a Senior Software Engineer. You excel at taking architecture blueprints and generating entire working applications from scratch. You output raw, pristine code blocks without markdown wrapper tags unless requested.',
    );
  }

  /**
   * Bootstraps a feature or application based on the architect's design.
   * @param {Object} architecture - The JSON architecture design
   * @param {string} specificTask - The specific task to implement
   */
  async codeFeature(architecture, specificTask) {
    logger.info(`💻 [GeminiCoder] Bootstrapping feature: ${specificTask}...`);

    const prompt = `
Using the following architectural blueprint, implement the requested feature.
Write production-ready, clean code with full JSDoc comments.

ARCHITECTURE:
${JSON.stringify(architecture)}

FEATURE TO IMPLEMENT:
${specificTask}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A');

      logger.info(`💻 [GeminiCoder] Feature coded successfully.`);
      return output.trim();
    } catch (err) {
      logger.error(`❌ [GeminiCoder] Failed to code feature: ${err.message}`);
      throw err;
    }
  }
}

export const geminiCoderAgent = Object.freeze(new GeminiCoderAgent());
