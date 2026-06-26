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

class SystemsProvisioningPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_provisioning_planner_agent',
      'Systems Provisioning Planner',
      'You are an elite Systems Provisioning Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Provisioning.',
    );
  }

  async generateSystemsProvisioningSystem(objective) {
    logger.info(
      `💻 [SystemsProvisioningPlannerAgent] Analyzing Systems Provisioning Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Provisioning Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Provisioning Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [SystemsProvisioningPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const systemsProvisioningPlannerAgent = Object.freeze(
  new SystemsProvisioningPlannerAgent(),
);
