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

class LispSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'lisp_specialist',
      'Lisp Specialist',
      'You are an elite Lisp Specialist. You specialize in: Symbolic expressions, macros, and foundational AI algorithms.',
    );
  }

  async generateLispSystem(objective) {
    logger.info(`💻 [LispSpecialistAgent] Analyzing Lisp requirements...`);
    const prompt = `Analyze the Lisp requirement: ${objective}. Output valid Lisp code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Lisp Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [LispSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const LispSpecialistAgentInstance = Object.freeze(
  new LispSpecialistAgent(),
);
