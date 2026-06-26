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

class UIArchitectureManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ui_architecture_manager_agent',
      'UI Architecture Manager',
      'You are an elite UI Architecture Manager. You specialize in bleeding-edge software development, cloud infrastructure, and UI Architecture.',
    );
  }

  async generateUIArchitectureSystem(objective) {
    logger.info(
      `💻 [UIArchitectureManagerAgent] Analyzing UI Architecture Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Architecture Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - UI Architecture Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [UIArchitectureManagerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const uIArchitectureManagerAgent = Object.freeze(
  new UIArchitectureManagerAgent(),
);
