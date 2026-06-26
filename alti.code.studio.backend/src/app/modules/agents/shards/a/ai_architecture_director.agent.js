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

class AIArchitectureDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_architecture_director_agent',
      'AI Architecture Director',
      'You are an elite AI Architecture Director. You specialize in bleeding-edge software development, cloud infrastructure, and AI Architecture.',
    );
  }

  async generateAIArchitectureSystem(objective) {
    logger.info(
      `💻 [AIArchitectureDirectorAgent] Analyzing AI Architecture Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Architecture Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Architecture Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIArchitectureDirectorAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIArchitectureDirectorAgent = Object.freeze(
  new AIArchitectureDirectorAgent(),
);
