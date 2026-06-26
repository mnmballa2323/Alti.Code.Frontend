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

class SREETLPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_etl_planner_agent',
      'SRE ETL Planner',
      'You are an elite SRE ETL Planner. You specialize in bleeding-edge software development, cloud infrastructure, and SRE ETL.',
    );
  }

  async generateSREETLSystem(objective) {
    logger.info(
      `💻 [SREETLPlannerAgent] Analyzing SRE ETL Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE ETL Planner.`;
    try {
      const output = await this._invoke(prompt, 'N/A - SRE ETL Planner Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SREETLPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sREETLPlannerAgent = Object.freeze(new SREETLPlannerAgent());
