/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class APLSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'apl_specialist',
      'APL Specialist',
      'You are an elite APL Specialist. You specialize in: Multidimensional array math and symbolic finance programming.',
    );
  }

  async generateAPLSystem(objective) {
    logger.info(`💻 [APLSpecialistAgent] Analyzing APL requirements...`);
    const prompt = `Analyze the APL requirement: ${objective}. Output valid APL code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - APL Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [APLSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const APLSpecialistAgentInstance = new APLSpecialistAgent();
