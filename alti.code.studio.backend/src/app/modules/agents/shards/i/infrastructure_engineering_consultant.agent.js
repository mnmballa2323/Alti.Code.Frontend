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

class InfrastructureEngineeringConsultantAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'infrastructure_engineering_consultant_agent',
      'Infrastructure Engineering Consultant',
      'You are an elite Infrastructure Engineering Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Engineering.',
    );
  }

  async generateInfrastructureEngineeringSystem(objective) {
    logger.info(
      `💻 [InfrastructureEngineeringConsultantAgent] Analyzing Infrastructure Engineering Consultant specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Engineering Consultant.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Infrastructure Engineering Consultant Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [InfrastructureEngineeringConsultantAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const infrastructureEngineeringConsultantAgent = Object.freeze(
  new InfrastructureEngineeringConsultantAgent(),
);
