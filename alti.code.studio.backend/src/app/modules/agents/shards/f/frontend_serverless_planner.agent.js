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

class FrontendServerlessPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'frontend_serverless_planner_agent',
      'Frontend Serverless Planner',
      'You are an elite Frontend Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Frontend Serverless.',
    );
  }

  async generateFrontendServerlessSystem(objective) {
    logger.info(
      `💻 [FrontendServerlessPlannerAgent] Analyzing Frontend Serverless Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Frontend Serverless Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Frontend Serverless Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FrontendServerlessPlannerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const frontendServerlessPlannerAgent = Object.freeze(
  new FrontendServerlessPlannerAgent(),
);
