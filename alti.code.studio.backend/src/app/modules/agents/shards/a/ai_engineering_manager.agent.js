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

class AIEngineeringManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_engineering_manager_agent',
      'AI Engineering Manager',
      'You are an elite AI Engineering Manager. You specialize in bleeding-edge software development, cloud infrastructure, and AI Engineering.',
    );
  }

  async generateAIEngineeringSystem(objective) {
    logger.info(
      `💻 [AIEngineeringManagerAgent] Analyzing AI Engineering Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Engineering Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Engineering Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIEngineeringManagerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIEngineeringManagerAgent = Object.freeze(
  new AIEngineeringManagerAgent(),
);
