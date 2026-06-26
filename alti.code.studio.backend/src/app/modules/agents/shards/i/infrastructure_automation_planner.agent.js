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

class InfrastructureAutomationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'infrastructure_automation_planner_agent',
      'Infrastructure Automation Planner',
      'You are an elite Infrastructure Automation Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Automation.',
    );
  }

  async generateInfrastructureAutomationSystem(objective) {
    logger.info(
      `💻 [InfrastructureAutomationPlannerAgent] Analyzing Infrastructure Automation Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Automation Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Infrastructure Automation Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [InfrastructureAutomationPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const infrastructureAutomationPlannerAgent = Object.freeze(
  new InfrastructureAutomationPlannerAgent(),
);
