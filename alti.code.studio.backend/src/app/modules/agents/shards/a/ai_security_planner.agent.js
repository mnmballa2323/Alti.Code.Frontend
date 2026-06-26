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

class AISecurityPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_security_planner_agent',
      'AI Security Planner',
      'You are an elite AI Security Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Security.',
    );
  }

  async generateAISecuritySystem(objective) {
    logger.info(
      `💻 [AISecurityPlannerAgent] Analyzing AI Security Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Security Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Security Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AISecurityPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aISecurityPlannerAgent = Object.freeze(
  new AISecurityPlannerAgent(),
);
