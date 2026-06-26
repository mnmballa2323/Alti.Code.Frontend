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

class CloudTelemetryDirectorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cloud_telemetry_director_agent',
      'Cloud Telemetry Director',
      'You are an elite Cloud Telemetry Director. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Telemetry.',
    );
  }

  async generateCloudTelemetrySystem(objective) {
    logger.info(
      `💻 [CloudTelemetryDirectorAgent] Analyzing Cloud Telemetry Director specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Telemetry Director.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Cloud Telemetry Director Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [CloudTelemetryDirectorAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cloudTelemetryDirectorAgent = Object.freeze(
  new CloudTelemetryDirectorAgent(),
);
