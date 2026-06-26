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

class CloudArchitectureLeadAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_architecture_lead_agent',
      'Cloud Architecture Lead',
      'You are an elite Cloud Architecture Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Architecture.',
    );
  }

  async generateCloudArchitectureSystem(objective) {
    logger.info(
      `💻 [CloudArchitectureLeadAgent] Analyzing Cloud Architecture Lead specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Architecture Lead.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Architecture Lead Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudArchitectureLeadAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudArchitectureLeadAgent = Object.freeze(
  new CloudArchitectureLeadAgent(),
);
