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

class BackendDataWarehouseSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_datawarehouse_specialist_agent',
      'Backend DataWarehouse Specialist',
      'You are an elite Backend DataWarehouse Specialist. You specialize in bleeding-edge software development, cloud infrastructure, and Backend DataWarehouse.',
    );
  }

  async generateBackendDataWarehouseSystem(objective) {
    logger.info(
      `💻 [BackendDataWarehouseSpecialistAgent] Analyzing Backend DataWarehouse Specialist specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend DataWarehouse Specialist.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend DataWarehouse Specialist Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [BackendDataWarehouseSpecialistAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const backendDataWarehouseSpecialistAgent = Object.freeze(
  new BackendDataWarehouseSpecialistAgent(),
);
