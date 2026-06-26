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

class SystemsArchitecturePlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_architecture_planner_agent',
      'Systems Architecture Planner',
      'You are an elite Systems Architecture Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Architecture.',
    );
  }

  async generateSystemsArchitectureSystem(objective) {
    logger.info(
      `💻 [SystemsArchitecturePlannerAgent] Analyzing Systems Architecture Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Architecture Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Architecture Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [SystemsArchitecturePlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const systemsArchitecturePlannerAgent = Object.freeze(
  new SystemsArchitecturePlannerAgent(),
);
