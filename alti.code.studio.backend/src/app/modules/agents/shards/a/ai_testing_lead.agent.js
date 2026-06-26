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

class AITestingLeadAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_testing_lead_agent',
      'AI Testing Lead',
      'You are an elite AI Testing Lead. You specialize in bleeding-edge software development, cloud infrastructure, and AI Testing.',
    );
  }

  async generateAITestingSystem(objective) {
    logger.info(
      `💻 [AITestingLeadAgent] Analyzing AI Testing Lead specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Testing Lead.`;
    try {
      const output = await this._invoke(prompt, 'N/A - AI Testing Lead Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AITestingLeadAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aITestingLeadAgent = Object.freeze(new AITestingLeadAgent());
