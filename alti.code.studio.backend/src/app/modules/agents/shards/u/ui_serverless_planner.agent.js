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

class UIServerlessPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ui_serverless_planner_agent',
      'UI Serverless Planner',
      'You are an elite UI Serverless Planner. You specialize in bleeding-edge software development, cloud infrastructure, and UI Serverless.',
    );
  }

  async generateUIServerlessSystem(objective) {
    logger.info(
      `💻 [UIServerlessPlannerAgent] Analyzing UI Serverless Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Serverless Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - UI Serverless Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [UIServerlessPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const uIServerlessPlannerAgent = Object.freeze(
  new UIServerlessPlannerAgent(),
);
