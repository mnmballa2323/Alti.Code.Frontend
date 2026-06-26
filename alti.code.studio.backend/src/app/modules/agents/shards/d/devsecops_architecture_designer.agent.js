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

class DevSecOpsArchitectureDesignerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'devsecops_architecture_designer_agent',
      'DevSecOps Architecture Designer',
      'You are an elite DevSecOps Architecture Designer. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Architecture.',
    );
  }

  async generateDevSecOpsArchitectureSystem(objective) {
    logger.info(
      `💻 [DevSecOpsArchitectureDesignerAgent] Analyzing DevSecOps Architecture Designer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Architecture Designer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - DevSecOps Architecture Designer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [DevSecOpsArchitectureDesignerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const devSecOpsArchitectureDesignerAgent = Object.freeze(
  new DevSecOpsArchitectureDesignerAgent(),
);
