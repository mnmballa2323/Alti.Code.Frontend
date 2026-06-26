/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class BluespecSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'bluespec_specialist',
      'Bluespec Specialist',
      'You are an elite Bluespec Specialist. You specialize in: High-level hardware design for ASIC/FPGA.',
    );
  }

  async generateBluespecSystem(objective) {
    logger.info(
      `💻 [BluespecSpecialistAgent] Analyzing Bluespec requirements...`,
    );
    const prompt = `Analyze the Bluespec requirement: ${objective}. Output valid Bluespec code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Bluespec Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [BluespecSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const BluespecSpecialistAgentInstance = new BluespecSpecialistAgent();
