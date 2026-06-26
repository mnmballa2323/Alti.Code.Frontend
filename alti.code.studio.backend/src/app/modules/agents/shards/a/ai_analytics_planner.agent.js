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

class AIAnalyticsPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_analytics_planner_agent',
      'AI Analytics Planner',
      'You are an elite AI Analytics Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Analytics.',
    );
  }

  async generateAIAnalyticsSystem(objective) {
    logger.info(
      `💻 [AIAnalyticsPlannerAgent] Analyzing AI Analytics Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Analytics Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Analytics Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIAnalyticsPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIAnalyticsPlannerAgent = Object.freeze(
  new AIAnalyticsPlannerAgent(),
);
