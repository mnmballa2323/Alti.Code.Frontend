/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class CUDASpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cuda_specialist',
      'CUDA Specialist',
      'You are an elite CUDA Specialist. You specialize in: Nvidia GPU parallel computing and tensor matrix math.',
    );
  }

  async generateCUDASystem(objective) {
    logger.info(`💻 [CUDASpecialistAgent] Analyzing CUDA requirements...`);
    const prompt = `Analyze the CUDA requirement: ${objective}. Output valid CUDA code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - CUDA Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CUDASpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const CUDASpecialistAgentInstance = new CUDASpecialistAgent();
