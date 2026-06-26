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

class AIOrchestrationPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ai_orchestration_planner_agent',
      'AI Orchestration Planner',
      'You are an elite AI Orchestration Planner. You specialize in bleeding-edge software development, cloud infrastructure, and AI Orchestration.',
    );
  }

  async generateAIOrchestrationSystem(objective) {
    logger.info(
      `💻 [AIOrchestrationPlannerAgent] Analyzing AI Orchestration Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for AI Orchestration Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - AI Orchestration Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [AIOrchestrationPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const aIOrchestrationPlannerAgent = Object.freeze(
  new AIOrchestrationPlannerAgent(),
);
