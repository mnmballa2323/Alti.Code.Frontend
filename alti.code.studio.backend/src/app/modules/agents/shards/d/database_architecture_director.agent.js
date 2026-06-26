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

class DatabaseArchitectureDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'database_architecture_director_agent',
      'Database Architecture Director',
      'You are an elite Database Architecture Director. You specialize in bleeding-edge software development, cloud infrastructure, and Database Architecture.',
    );
  }

  async generateDatabaseArchitectureSystem(objective) {
    logger.info(
      `💻 [DatabaseArchitectureDirectorAgent] Analyzing Database Architecture Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Database Architecture Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Database Architecture Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DatabaseArchitectureDirectorAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const databaseArchitectureDirectorAgent = Object.freeze(
  new DatabaseArchitectureDirectorAgent(),
);
