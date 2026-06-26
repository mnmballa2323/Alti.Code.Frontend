/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class SYCLSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sycl_specialist',
      'SYCL Specialist',
      'You are an elite SYCL Specialist. You specialize in: Single-source C++ for heterogeneous computing.',
    );
  }

  async generateSYCLSystem(objective) {
    logger.info(`💻 [SYCLSpecialistAgent] Analyzing SYCL requirements...`);
    const prompt = `Analyze the SYCL requirement: ${objective}. Output valid SYCL code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - SYCL Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SYCLSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const SYCLSpecialistAgentInstance = new SYCLSpecialistAgent();
