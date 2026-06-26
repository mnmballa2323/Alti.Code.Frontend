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

class BackendEngineeringTesterAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_engineering_tester_agent',
      'Backend Engineering Tester',
      'You are an elite Backend Engineering Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Engineering.',
    );
  }

  async generateBackendEngineeringSystem(objective) {
    logger.info(
      `💻 [BackendEngineeringTesterAgent] Analyzing Backend Engineering Tester specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Engineering Tester.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend Engineering Tester Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [BackendEngineeringTesterAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const backendEngineeringTesterAgent = Object.freeze(
  new BackendEngineeringTesterAgent(),
);
