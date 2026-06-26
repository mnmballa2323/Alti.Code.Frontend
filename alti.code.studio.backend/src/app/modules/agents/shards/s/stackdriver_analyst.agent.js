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

class StackdriverAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'stackdriver_analyst',
      'GCP Stackdriver Observability Analyst',
      'You are a Google Cloud Platform Site Reliability Engineer (SRE). Your role is to ingest raw JSON logs from Stackdriver / Cloud Logging, identify critical anomalies, and dispatch auto-scaling or healing commands back to the Swarm.',
    );
  }

  /**
   * Analyzes raw GCP logs for anomalies or crashes.
   * @param {Array} cloudLogs - Array of raw JSON logs from GCP
   */
  async analyzeLogs(cloudLogs) {
    logger.info(
      `📊 [StackdriverAnalyst] Analyzing ${cloudLogs.length} Cloud Logging entries...`,
    );

    const prompt = `
Analyze the following GCP Stackdriver logs.
Identify any 500 errors, latency spikes, or memory leaks.
If the system is healthy, return { "status": "HEALTHY", "action": "NONE" }.
If an anomaly is detected, return { "status": "DEGRADED", "action": "REVERT", "reason": "..." }.

LOGS:
${JSON.stringify(cloudLogs, null, 2)}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Observability Scope');
      const cleanOutput = output.replace(/```json|```/g, '').trim();
      const diagnosis = JSON.parse(cleanOutput);

      if (diagnosis.status !== 'HEALTHY') {
        logger.warn(
          `⚠️ [StackdriverAnalyst] Anomaly detected: ${diagnosis.reason}`,
        );
      } else {
        logger.info(
          `✅ [StackdriverAnalyst] Deployment verified stable via Stackdriver logs.`,
        );
      }

      return diagnosis;
    } catch (err) {
      logger.error(
        `❌ [StackdriverAnalyst] Failed to analyze logs: ${err.message}`,
      );
      throw err;
    }
  }
}

export const stackdriverAnalystAgent = Object.freeze(
  new StackdriverAnalystAgent(),
);
