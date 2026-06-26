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

class BackendObservabilityDesignerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_observability_designer_agent',
      'Backend Observability Designer',
      'You are an elite Backend Observability Designer. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Observability.',
    );
  }

  async generateBackendObservabilitySystem(objective) {
    logger.info(
      `💻 [BackendObservabilityDesignerAgent] Analyzing Backend Observability Designer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Observability Designer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend Observability Designer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [BackendObservabilityDesignerAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const backendObservabilityDesignerAgent = Object.freeze(
  new BackendObservabilityDesignerAgent(),
);
