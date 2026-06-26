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

class SystemsTelemetryLeadAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'systems_telemetry_lead_agent',
      'Systems Telemetry Lead',
      'You are an elite Systems Telemetry Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Telemetry.',
    );
  }

  async generateSystemsTelemetrySystem(objective) {
    logger.info(
      `💻 [SystemsTelemetryLeadAgent] Analyzing Systems Telemetry Lead specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Telemetry Lead.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Systems Telemetry Lead Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SystemsTelemetryLeadAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const systemsTelemetryLeadAgent = Object.freeze(
  new SystemsTelemetryLeadAgent(),
);
