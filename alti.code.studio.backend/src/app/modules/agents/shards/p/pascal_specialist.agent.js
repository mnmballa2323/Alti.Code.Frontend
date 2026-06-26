// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class PascalSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'pascal_specialist',
      'Pascal Specialist',
      'You are an elite Pascal Specialist. You specialize in: Delphi RAD Studio and legacy educational software.',
    );
  }

  async generatePascalSystem(objective) {
    logger.info(`💻 [PascalSpecialistAgent] Analyzing Pascal requirements...`);
    const prompt = `Analyze the Pascal requirement: ${objective}. Output valid Pascal code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Pascal Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [PascalSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const PascalSpecialistAgentInstance = Object.freeze(
  new PascalSpecialistAgent(),
);
