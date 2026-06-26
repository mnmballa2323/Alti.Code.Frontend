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

class FullStackArchitectureLeadAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_architecture_lead_agent',
      'FullStack Architecture Lead',
      'You are an elite FullStack Architecture Lead. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Architecture.',
    );
  }

  async generateFullStackArchitectureSystem(objective) {
    logger.info(
      `💻 [FullStackArchitectureLeadAgent] Analyzing FullStack Architecture Lead specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Architecture Lead.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Architecture Lead Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackArchitectureLeadAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackArchitectureLeadAgent = Object.freeze(
  new FullStackArchitectureLeadAgent(),
);
