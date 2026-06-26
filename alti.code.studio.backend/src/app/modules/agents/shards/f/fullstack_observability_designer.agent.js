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

class FullStackObservabilityDesignerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fullstack_observability_designer_agent',
      'FullStack Observability Designer',
      'You are an elite FullStack Observability Designer. You specialize in bleeding-edge software development, cloud infrastructure, and FullStack Observability.',
    );
  }

  async generateFullStackObservabilitySystem(objective) {
    logger.info(
      `💻 [FullStackObservabilityDesignerAgent] Analyzing FullStack Observability Designer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for FullStack Observability Designer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - FullStack Observability Designer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [FullStackObservabilityDesignerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const fullStackObservabilityDesignerAgent = Object.freeze(
  new FullStackObservabilityDesignerAgent(),
);
