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

class InfrastructureCachingDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'infrastructure_caching_director_agent',
      'Infrastructure Caching Director',
      'You are an elite Infrastructure Caching Director. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Caching.',
    );
  }

  async generateInfrastructureCachingSystem(objective) {
    logger.info(
      `💻 [InfrastructureCachingDirectorAgent] Analyzing Infrastructure Caching Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Caching Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Infrastructure Caching Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [InfrastructureCachingDirectorAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const infrastructureCachingDirectorAgent = Object.freeze(
  new InfrastructureCachingDirectorAgent(),
);
