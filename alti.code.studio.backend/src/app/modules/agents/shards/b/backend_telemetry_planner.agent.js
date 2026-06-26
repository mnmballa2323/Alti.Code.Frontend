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

class BackendTelemetryPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'backend_telemetry_planner_agent',
      'Backend Telemetry Planner',
      'You are an elite Backend Telemetry Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Telemetry.',
    );
  }

  async generateBackendTelemetrySystem(objective) {
    logger.info(
      `💻 [BackendTelemetryPlannerAgent] Analyzing Backend Telemetry Planner specifications...`,
    );
    const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Telemetry Planner.`;
    try {
      const output = await this._invoke(
        prompt,
        'N/A - Backend Telemetry Planner Target',
      );
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [BackendTelemetryPlannerAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const backendTelemetryPlannerAgent = Object.freeze(
  new BackendTelemetryPlannerAgent(),
);
