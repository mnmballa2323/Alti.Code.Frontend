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

class InfrastructureServerlessPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'infrastructure_serverless_planner_agent',
      'Infrastructure Serverless Planner',
      'You are an elite Infrastructure Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Serverless.',
    );
  }

  async generateInfrastructureServerlessSystem(objective) {
    logger.info(
      `💻 [InfrastructureServerlessPlannerAgent] Analyzing Infrastructure Serverless Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Serverless Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Infrastructure Serverless Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [InfrastructureServerlessPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const infrastructureServerlessPlannerAgent = Object.freeze(
  new InfrastructureServerlessPlannerAgent(),
);
