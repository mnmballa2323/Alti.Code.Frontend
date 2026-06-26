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

class DataEngineeringPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'data_engineering_planner_agent',
      'Data Engineering Planner',
      'You are an elite Data Engineering Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Data Engineering.',
    );
  }

  async generateDataEngineeringSystem(objective) {
    logger.info(
      `💻 [DataEngineeringPlannerAgent] Analyzing Data Engineering Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Data Engineering Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Data Engineering Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DataEngineeringPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const dataEngineeringPlannerAgent = Object.freeze(
  new DataEngineeringPlannerAgent(),
);
