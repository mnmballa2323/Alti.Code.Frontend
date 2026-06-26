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

class BackendTestingConsultantAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_testing_consultant_agent',
      'Backend Testing Consultant',
      'You are an elite Backend Testing Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Testing.',
    );
  }

  async generateBackendTestingSystem(objective) {
    logger.info(
      `💻 [BackendTestingConsultantAgent] Analyzing Backend Testing Consultant specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Testing Consultant.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend Testing Consultant Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [BackendTestingConsultantAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const backendTestingConsultantAgent = Object.freeze(
  new BackendTestingConsultantAgent(),
);
