/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class Inform7SpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'inform_specialist',
      'Inform 7 Specialist',
      'You are an elite Inform 7 Specialist. You specialize in: Natural language programming for interactive fiction.',
    );
  }

  async generateInform7System(objective) {
    logger.info(
      `💻 [Inform7SpecialistAgent] Analyzing Inform 7 requirements...`,
    );
    const prompt = `Analyze the Inform 7 requirement: ${objective}. Output valid Inform 7 code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Inform 7 Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [Inform7SpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const Inform7SpecialistAgentInstance = new Inform7SpecialistAgent();
