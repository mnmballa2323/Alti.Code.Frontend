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

class BackendETLPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_etl_planner_agent',
      'Backend ETL Planner',
      'You are an elite Backend ETL Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Backend ETL.',
    );
  }

  async generateBackendETLSystem(objective) {
    logger.info(
      `💻 [BackendETLPlannerAgent] Analyzing Backend ETL Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend ETL Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend ETL Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [BackendETLPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const backendETLPlannerAgent = Object.freeze(
  new BackendETLPlannerAgent(),
);
