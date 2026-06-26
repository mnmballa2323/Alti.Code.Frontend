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

class PureDataSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'puredata_specialist',
      'Pure Data Specialist',
      'You are an elite Pure Data Specialist. You specialize in: Open-source visual programming for multimedia.',
    );
  }

  async generatePureDataSystem(objective) {
    logger.info(
      `💻 [PureDataSpecialistAgent] Analyzing Pure Data requirements...`,
    );
    const prompt = `Analyze the Pure Data requirement: ${objective}. Output valid Pure Data code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Pure Data Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [PureDataSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const PureDataSpecialistAgentInstance = Object.freeze(
  new PureDataSpecialistAgent(),
);
