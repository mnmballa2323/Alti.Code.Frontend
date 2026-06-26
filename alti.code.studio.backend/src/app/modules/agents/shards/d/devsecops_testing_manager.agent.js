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

class DevSecOpsTestingManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devsecops_testing_manager_agent',
      'DevSecOps Testing Manager',
      'You are an elite DevSecOps Testing Manager. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Testing.',
    );
  }

  async generateDevSecOpsTestingSystem(objective) {
    logger.info(
      `💻 [DevSecOpsTestingManagerAgent] Analyzing DevSecOps Testing Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Testing Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevSecOps Testing Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [DevSecOpsTestingManagerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const devSecOpsTestingManagerAgent = Object.freeze(
  new DevSecOpsTestingManagerAgent(),
);
