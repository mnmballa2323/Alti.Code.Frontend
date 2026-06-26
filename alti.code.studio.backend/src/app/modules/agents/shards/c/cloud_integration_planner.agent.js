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

class CloudIntegrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_integration_planner_agent',
      'Cloud Integration Planner',
      'You are an elite Cloud Integration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Integration.',
    );
  }

  async generateCloudIntegrationSystem(objective) {
    logger.info(
      `💻 [CloudIntegrationPlannerAgent] Analyzing Cloud Integration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Integration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Integration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudIntegrationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudIntegrationPlannerAgent = Object.freeze(
  new CloudIntegrationPlannerAgent(),
);
