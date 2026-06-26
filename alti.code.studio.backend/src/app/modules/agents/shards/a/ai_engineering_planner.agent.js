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

class AIEngineeringPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_engineering_planner_agent',
      'AI Engineering Planner',
      'You are an elite AI Engineering Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Engineering.',
    );
  }

  async generateAIEngineeringSystem(objective) {
    logger.info(
      `💻 [AIEngineeringPlannerAgent] Analyzing AI Engineering Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Engineering Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Engineering Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIEngineeringPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIEngineeringPlannerAgent = Object.freeze(
  new AIEngineeringPlannerAgent(),
);
