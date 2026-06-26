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

class BackendSecurityDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_security_director_agent',
      'Backend Security Director',
      'You are an elite Backend Security Director. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Security.',
    );
  }

  async generateBackendSecuritySystem(objective) {
    logger.info(
      `💻 [BackendSecurityDirectorAgent] Analyzing Backend Security Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Security Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend Security Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [BackendSecurityDirectorAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const backendSecurityDirectorAgent = Object.freeze(
  new BackendSecurityDirectorAgent(),
);
