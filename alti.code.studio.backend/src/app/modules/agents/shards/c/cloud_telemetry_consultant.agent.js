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

class CloudTelemetryConsultantAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_telemetry_consultant_agent',
      'Cloud Telemetry Consultant',
      'You are an elite Cloud Telemetry Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Telemetry.',
    );
  }

  async generateCloudTelemetrySystem(objective) {
    logger.info(
      `💻 [CloudTelemetryConsultantAgent] Analyzing Cloud Telemetry Consultant specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Telemetry Consultant.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Telemetry Consultant Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudTelemetryConsultantAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudTelemetryConsultantAgent = Object.freeze(
  new CloudTelemetryConsultantAgent(),
);
