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

class RustSubstrateSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'rust_substrate_specialist',
      'Rust Substrate Specialist',
      'You are an elite Rust Substrate Specialist. You specialize in: Polkadot blockchain development and Web3 infrastructure.',
    );
  }

  async generateRustSubstrateSystem(objective) {
    logger.info(
      `💻 [RustSubstrateSpecialistAgent] Analyzing Rust Substrate requirements...`,
    );
    const prompt = `Analyze the Rust Substrate requirement: ${objective}. Output valid Rust Substrate code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Rust Substrate Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [RustSubstrateSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const RustSubstrateSpecialistAgentInstance = Object.freeze(
  new RustSubstrateSpecialistAgent(),
);
