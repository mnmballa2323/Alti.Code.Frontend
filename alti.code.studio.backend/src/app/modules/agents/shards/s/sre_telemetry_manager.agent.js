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

class SRETelemetryManagerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_telemetry_manager_agent',
      'SRE Telemetry Manager',
      'You are an elite SRE Telemetry Manager. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Telemetry.',
    );
  }

  async generateSRETelemetrySystem(objective) {
    logger.info(
      `💻 [SRETelemetryManagerAgent] Analyzing SRE Telemetry Manager specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Telemetry Manager.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - SRE Telemetry Manager Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SRETelemetryManagerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sRETelemetryManagerAgent = Object.freeze(
  new SRETelemetryManagerAgent(),
);
