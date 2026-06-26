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

class PureScriptSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'purescript_specialist',
      'PureScript Specialist',
      'You are an elite PureScript Specialist. You specialize in: Strongly-typed functional programming compiling to JavaScript.',
    );
  }

  async generatePureScriptSystem(objective) {
    logger.info(
      `💻 [PureScriptSpecialistAgent] Analyzing PureScript requirements...`,
    );
    const prompt = `Analyze the PureScript requirement: ${objective}. Output valid PureScript code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - PureScript Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [PureScriptSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const PureScriptSpecialistAgentInstance = Object.freeze(
  new PureScriptSpecialistAgent(),
);
