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

class FullStackEngineeringDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_engineering_director_agent',
      'FullStack Engineering Director',
      'You are an elite FullStack Engineering Director. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Engineering.',
    );
  }

  async generateFullStackEngineeringSystem(objective) {
    logger.info(
      `💻 [FullStackEngineeringDirectorAgent] Analyzing FullStack Engineering Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Engineering Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Engineering Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackEngineeringDirectorAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackEngineeringDirectorAgent = Object.freeze(
  new FullStackEngineeringDirectorAgent(),
);
