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

class AIObservabilityPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_observability_planner_agent',
      'AI Observability Planner',
      'You are an elite AI Observability Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Observability.',
    );
  }

  async generateAIObservabilitySystem(objective) {
    logger.info(
      `💻 [AIObservabilityPlannerAgent] Analyzing AI Observability Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Observability Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Observability Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIObservabilityPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIObservabilityPlannerAgent = Object.freeze(
  new AIObservabilityPlannerAgent(),
);
