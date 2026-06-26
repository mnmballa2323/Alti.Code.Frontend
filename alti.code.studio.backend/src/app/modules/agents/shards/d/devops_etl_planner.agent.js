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

class DevOpsETLPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devops_etl_planner_agent',
      'DevOps ETL Planner',
      'You are an elite DevOps ETL Planner. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps ETL.',
    );
  }

  async generateDevOpsETLSystem(objective) {
    logger.info(
      `💻 [DevOpsETLPlannerAgent] Analyzing DevOps ETL Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps ETL Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevOps ETL Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DevOpsETLPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const devOpsETLPlannerAgent = Object.freeze(new DevOpsETLPlannerAgent());
