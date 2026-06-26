/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class AgdaSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'agda_specialist',
      'Agda Specialist',
      'You are an elite Agda Specialist. You specialize in: Dependently typed programming and proof assistant.',
    );
  }

  async generateAgdaSystem(objective) {
    logger.info(`💻 [AgdaSpecialistAgent] Analyzing Agda requirements...`);
    const prompt = `Analyze the Agda requirement: ${objective}. Output valid Agda code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Agda Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AgdaSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const AgdaSpecialistAgentInstance = new AgdaSpecialistAgent();
