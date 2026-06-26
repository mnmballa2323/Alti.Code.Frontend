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

class SREArchitectureLeadAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_architecture_lead_agent',
      'SRE Architecture Lead',
      'You are an elite SRE Architecture Lead. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Architecture.',
    );
  }

  async generateSREArchitectureSystem(objective) {
    logger.info(
      `💻 [SREArchitectureLeadAgent] Analyzing SRE Architecture Lead specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Architecture Lead.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - SRE Architecture Lead Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SREArchitectureLeadAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sREArchitectureLeadAgent = Object.freeze(
  new SREArchitectureLeadAgent(),
);
