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

class SREDataWarehousePlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_datawarehouse_planner_agent',
      'SRE DataWarehouse Planner',
      'You are an elite SRE DataWarehouse Planner. You specialize in bleeding-edge software development, cloud infrastructure, and SRE DataWarehouse.',
    );
  }

  async generateSREDataWarehouseSystem(objective) {
    logger.info(
      `💻 [SREDataWarehousePlannerAgent] Analyzing SRE DataWarehouse Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE DataWarehouse Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - SRE DataWarehouse Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SREDataWarehousePlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sREDataWarehousePlannerAgent = Object.freeze(
  new SREDataWarehousePlannerAgent(),
);
