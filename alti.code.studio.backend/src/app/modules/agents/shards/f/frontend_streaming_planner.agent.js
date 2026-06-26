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

class FrontendStreamingPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'frontend_streaming_planner_agent',
      'Frontend Streaming Planner',
      'You are an elite Frontend Streaming Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Frontend Streaming.',
    );
  }

  async generateFrontendStreamingSystem(objective) {
    logger.info(
      `💻 [FrontendStreamingPlannerAgent] Analyzing Frontend Streaming Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Frontend Streaming Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Frontend Streaming Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [FrontendStreamingPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const frontendStreamingPlannerAgent = Object.freeze(
  new FrontendStreamingPlannerAgent(),
);
