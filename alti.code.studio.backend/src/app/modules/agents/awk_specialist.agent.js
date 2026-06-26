/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class AWKSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'awk_specialist',
      'AWK Specialist',
      'You are an elite AWK Specialist. You specialize in: Text stream processing and UNIX shell one-liners.',
    );
  }

  async generateAWKSystem(objective) {
    logger.info(`💻 [AWKSpecialistAgent] Analyzing AWK requirements...`);
    const prompt = `Analyze the AWK requirement: ${objective}. Output valid AWK code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - AWK Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AWKSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const AWKSpecialistAgentInstance = new AWKSpecialistAgent();
