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

class SRETelemetryDesignerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'sre_telemetry_designer_agent',
      'SRE Telemetry Designer',
      'You are an elite SRE Telemetry Designer. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Telemetry.',
    );
  }

  async generateSRETelemetrySystem(objective) {
    logger.info(
      `💻 [SRETelemetryDesignerAgent] Analyzing SRE Telemetry Designer specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Telemetry Designer.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - SRE Telemetry Designer Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SRETelemetryDesignerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const sRETelemetryDesignerAgent = Object.freeze(
  new SRETelemetryDesignerAgent(),
);
