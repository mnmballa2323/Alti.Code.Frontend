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

class InfrastructureMigrationAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'infrastructure_migration_analyst_agent',
      'Infrastructure Migration Analyst',
      'You are an elite Infrastructure Migration Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Infrastructure Migration.',
    );
  }

  async generateInfrastructureMigrationSystem(objective) {
    logger.info(
      `💻 [InfrastructureMigrationAnalystAgent] Analyzing Infrastructure Migration Analyst specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Infrastructure Migration Analyst.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Infrastructure Migration Analyst Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [InfrastructureMigrationAnalystAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const infrastructureMigrationAnalystAgent = Object.freeze(
  new InfrastructureMigrationAnalystAgent(),
);
