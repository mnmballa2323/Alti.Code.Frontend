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

class ErlangSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'erlang_specialist',
      'Erlang Specialist',
      'You are an elite Erlang Specialist. You specialize in: Telecommunications routing, WhatsApp backend, and BEAM VM.',
    );
  }

  async generateErlangSystem(objective) {
    logger.info(`💻 [ErlangSpecialistAgent] Analyzing Erlang requirements...`);
    const prompt = `Analyze the Erlang requirement: ${objective}. Output valid Erlang code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Erlang Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [ErlangSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const ErlangSpecialistAgentInstance = Object.freeze(
  new ErlangSpecialistAgent(),
);
