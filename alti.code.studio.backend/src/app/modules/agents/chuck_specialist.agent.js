/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ChucKSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'chuck_specialist',
      'ChucK Specialist',
      'You are an elite ChucK Specialist. You specialize in: Strongly-timed concurrent audio programming and synthesis.',
    );
  }

  async generateChucKSystem(objective) {
    logger.info(`💻 [ChucKSpecialistAgent] Analyzing ChucK requirements...`);
    const prompt = `Analyze the ChucK requirement: ${objective}. Output valid ChucK code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - ChucK Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [ChucKSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const ChucKSpecialistAgentInstance = new ChucKSpecialistAgent();
