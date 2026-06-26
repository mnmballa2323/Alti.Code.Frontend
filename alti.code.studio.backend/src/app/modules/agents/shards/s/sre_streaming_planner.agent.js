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

class SREStreamingPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_streaming_planner_agent',
      'SRE Streaming Planner',
      'You are an elite SRE Streaming Planner. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Streaming.',
    );
  }

  async generateSREStreamingSystem(objective) {
    logger.info(
      `💻 [SREStreamingPlannerAgent] Analyzing SRE Streaming Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Streaming Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - SRE Streaming Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SREStreamingPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sREStreamingPlannerAgent = Object.freeze(
  new SREStreamingPlannerAgent(),
);
