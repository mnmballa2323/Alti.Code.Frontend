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

class ElmSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'elm_specialist',
      'Elm Specialist',
      'You are an elite Elm Specialist. You specialize in: Purely functional front-end web development with zero runtime exceptions.',
    );
  }

  async generateElmSystem(objective) {
    logger.info(`💻 [ElmSpecialistAgent] Analyzing Elm requirements...`);
    const prompt = `Analyze the Elm requirement: ${objective}. Output valid Elm code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Elm Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [ElmSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const ElmSpecialistAgentInstance = Object.freeze(
  new ElmSpecialistAgent(),
);
