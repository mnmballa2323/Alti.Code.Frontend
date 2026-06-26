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

class ReasonMLSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'reasonml_specialist',
      'ReasonML Specialist',
      'You are an elite ReasonML Specialist. You specialize in: OCaml syntax for React developers (React Native).',
    );
  }

  async generateReasonMLSystem(objective) {
    logger.info(
      `💻 [ReasonMLSpecialistAgent] Analyzing ReasonML requirements...`,
    );
    const prompt = `Analyze the ReasonML requirement: ${objective}. Output valid ReasonML code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - ReasonML Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [ReasonMLSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const ReasonMLSpecialistAgentInstance = Object.freeze(
  new ReasonMLSpecialistAgent(),
);
