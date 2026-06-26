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

class InfrastructureArchitectureDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'infrastructure_architecture_director_agent',
      'Infrastructure Architecture Director',
      'You are an elite Infrastructure Architecture Director. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Architecture.',
    );
  }

  async generateInfrastructureArchitectureSystem(objective) {
    logger.info(
      `💻 [InfrastructureArchitectureDirectorAgent] Analyzing Infrastructure Architecture Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Architecture Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Infrastructure Architecture Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [InfrastructureArchitectureDirectorAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const infrastructureArchitectureDirectorAgent = Object.freeze(
  new InfrastructureArchitectureDirectorAgent(),
);
