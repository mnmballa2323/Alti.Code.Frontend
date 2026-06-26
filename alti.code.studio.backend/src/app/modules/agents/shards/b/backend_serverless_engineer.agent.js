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

class BackendServerlessEngineerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_serverless_engineer_agent',
      'Backend Serverless Engineer',
      'You are an elite Backend Serverless Engineer. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Serverless.',
    );
  }

  async generateBackendServerlessSystem(objective) {
    logger.info(
      `💻 [BackendServerlessEngineerAgent] Analyzing Backend Serverless Engineer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Serverless Engineer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend Serverless Engineer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [BackendServerlessEngineerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const backendServerlessEngineerAgent = Object.freeze(
  new BackendServerlessEngineerAgent(),
);
