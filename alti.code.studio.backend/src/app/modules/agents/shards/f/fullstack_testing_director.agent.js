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

class FullStackTestingDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_testing_director_agent',
      'FullStack Testing Director',
      'You are an elite FullStack Testing Director. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Testing.',
    );
  }

  async generateFullStackTestingSystem(objective) {
    logger.info(
      `💻 [FullStackTestingDirectorAgent] Analyzing FullStack Testing Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Testing Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Testing Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [FullStackTestingDirectorAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const fullStackTestingDirectorAgent = Object.freeze(
  new FullStackTestingDirectorAgent(),
);
