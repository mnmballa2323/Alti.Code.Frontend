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

class CloudMigrationConsultantAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_migration_consultant_agent',
      'Cloud Migration Consultant',
      'You are an elite Cloud Migration Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Migration.',
    );
  }

  async generateCloudMigrationSystem(objective) {
    logger.info(
      `💻 [CloudMigrationConsultantAgent] Analyzing Cloud Migration Consultant specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Migration Consultant.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Migration Consultant Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudMigrationConsultantAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudMigrationConsultantAgent = Object.freeze(
  new CloudMigrationConsultantAgent(),
);
