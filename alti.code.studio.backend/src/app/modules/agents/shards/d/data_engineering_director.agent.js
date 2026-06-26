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

class DataEngineeringDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'data_engineering_director_agent',
      'Data Engineering Director',
      'You are an elite Data Engineering Director. You specialize in bleeding-edge software development, cloud infrastructure, and Data Engineering.',
    );
  }

  async generateDataEngineeringSystem(objective) {
    logger.info(
      `💻 [DataEngineeringDirectorAgent] Analyzing Data Engineering Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Data Engineering Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Data Engineering Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DataEngineeringDirectorAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const dataEngineeringDirectorAgent = Object.freeze(
  new DataEngineeringDirectorAgent(),
);
