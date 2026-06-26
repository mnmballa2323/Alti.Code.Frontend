/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class HaxeSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'haxe_specialist',
      'Haxe Specialist',
      'You are an elite Haxe Specialist. You specialize in: Cross-platform game development compiling to all targets.',
    );
  }

  async generateHaxeSystem(objective) {
    logger.info(`💻 [HaxeSpecialistAgent] Analyzing Haxe requirements...`);
    const prompt = `Analyze the Haxe requirement: ${objective}. Output valid Haxe code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Haxe Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [HaxeSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const HaxeSpecialistAgentInstance = new HaxeSpecialistAgent();
