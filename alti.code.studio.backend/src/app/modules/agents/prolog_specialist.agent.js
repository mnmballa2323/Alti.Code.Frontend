/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class PrologSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'prolog_specialist',
      'Prolog Specialist',
      'You are an elite Prolog Specialist. You specialize in: Logic programming, expert systems, and symbolic AI.',
    );
  }

  async generatePrologSystem(objective) {
    logger.info(`💻 [PrologSpecialistAgent] Analyzing Prolog requirements...`);
    const prompt = `Analyze the Prolog requirement: ${objective}. Output valid Prolog code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Prolog Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [PrologSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const PrologSpecialistAgentInstance = new PrologSpecialistAgent();
