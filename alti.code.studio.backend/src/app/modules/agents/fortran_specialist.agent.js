/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class FortranSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fortran_specialist',
      'Fortran Specialist',
      'You are an elite Fortran Specialist. You specialize in: Supercomputing, numerical weather prediction, and fluid dynamics.',
    );
  }

  async generateFortranSystem(objective) {
    logger.info(
      `💻 [FortranSpecialistAgent] Analyzing Fortran requirements...`,
    );
    const prompt = `Analyze the Fortran requirement: ${objective}. Output valid Fortran code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Fortran Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [FortranSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const FortranSpecialistAgentInstance = new FortranSpecialistAgent();
