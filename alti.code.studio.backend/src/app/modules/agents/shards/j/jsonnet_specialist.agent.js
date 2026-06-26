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

class JsonnetSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'jsonnet_specialist',
      'Jsonnet Specialist',
      'You are an elite Jsonnet Specialist. You specialize in: Data templating for complex Kubernetes manifests.',
    );
  }

  async generateJsonnetSystem(objective) {
    logger.info(
      `💻 [JsonnetSpecialistAgent] Analyzing Jsonnet requirements...`,
    );
    const prompt = `Analyze the Jsonnet requirement: ${objective}. Output valid Jsonnet code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Jsonnet Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [JsonnetSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const JsonnetSpecialistAgentInstance = Object.freeze(
  new JsonnetSpecialistAgent(),
);
