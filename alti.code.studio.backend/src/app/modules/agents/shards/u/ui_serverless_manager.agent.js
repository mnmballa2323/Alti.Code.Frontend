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

class UIServerlessManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ui_serverless_manager_agent',
      'UI Serverless Manager',
      'You are an elite UI Serverless Manager. You specialize in bleeding-edge software development, cloud infrastructure, and UI Serverless.',
    );
  }

  async generateUIServerlessSystem(objective) {
    logger.info(
      `💻 [UIServerlessManagerAgent] Analyzing UI Serverless Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Serverless Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - UI Serverless Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [UIServerlessManagerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const uIServerlessManagerAgent = Object.freeze(
  new UIServerlessManagerAgent(),
);
