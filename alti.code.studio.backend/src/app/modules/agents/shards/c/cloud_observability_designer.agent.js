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

class CloudObservabilityDesignerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_observability_designer_agent',
      'Cloud Observability Designer',
      'You are an elite Cloud Observability Designer. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Observability.',
    );
  }

  async generateCloudObservabilitySystem(objective) {
    logger.info(
      `💻 [CloudObservabilityDesignerAgent] Analyzing Cloud Observability Designer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Observability Designer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Observability Designer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [CloudObservabilityDesignerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const cloudObservabilityDesignerAgent = Object.freeze(
  new CloudObservabilityDesignerAgent(),
);
