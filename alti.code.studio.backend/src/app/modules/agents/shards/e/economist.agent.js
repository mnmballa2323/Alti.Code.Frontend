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

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class FinOpsAgent {
  constructor() {
    this.name = 'economist';
    this.description = 'The Economist (Autonomic FinOps Agent)';
    this.capabilities = [
      'Analyze GCP Billing payloads, BigQuery execution metrics, and GKE utilization',
      'Detect over-provisioned instance classes and bloated storage tiers',
      'Generate actionable Terraform right-sizing patches and estimate savings',
    ];
  }

  /**
   * Inspects infrastructure configuration to determine cloud cost optimizations.
   * @param {string} telemetryData GCP Billing, BigQuery, or GKE JSON telemetry
   */
  async evaluateEconomics(telemetryData) {
    logger.info(
      `💸 The Economist: Scanning Google Cloud telemetry payload for cost inefficiencies...`,
    );

    try {
      const prompt = `
            You are "The Economist", a Principal FinOps Cloud Architect analyzing Google Cloud infrastructure for extreme cost optimization.

            Target Telemetry (GCP Billing, BigQuery Metrics, or GKE Stats):
            \`\`\`
            ${telemetryData}
            \`\`\`

            Find ways to reduce the cloud bill directly related to this telemetry. Look for over-provisioning (e.g., e2-standard-32 running idle), zombie GKE pods, or expensive unoptimized BigQuery scans.

            Return a pure JSON FinOps report:
            {
                "optimizationOpportunities": boolean,
                "currentAssessment": "Brief sentence explaining the current state of the GCP resources",
                "recommendation": "Technical strategy to right-size or transition",
                "estimatedSavingsPercent": number (0-100),
                "severity": "LOW" | "MEDIUM" | "HIGH",
                "terraformPatch": "string containing actual HCL terraform code to fix the issue, or null if not applicable"
            }
            Do not wrap JSON with markdown code ticks.
            `;

      const rawResponse = await GeminiAiService.generateContent(prompt);
      const reportJson = rawResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
      const finOpsReport = JSON.parse(reportJson);

      if (finOpsReport.optimizationOpportunities) {
        logger.warn(
          `💸 The Economist Alert! Found ${finOpsReport.severity} inefficiencies.`,
        );
        logger.info(`   Recommendation: ${finOpsReport.recommendation}`);
        logger.info(
          `   Potential Savings: ~${finOpsReport.estimatedSavingsPercent}%`,
        );
        if (finOpsReport.terraformPatch) {
          logger.info(`   Generated Terraform Patch to rectify.`);
        }
      } else {
        logger.info(
          `✅ The Economist: GCP Infrastructure appears optimally lean.`,
        );
      }

      return finOpsReport;
    } catch (err) {
      logger.error(`❌ The Economist Analysis Failed: ${err.message}`);
      throw err;
    }
  }

  async process(state) {
    const telemetry = state.data?.content || state.goal || '';

    const report = await this.evaluateEconomics(telemetry);

    return {
      ...state,
      status: 'success',
      results: [
        ...(state.results || []),
        `The Economist Saving Potential: ${report.estimatedSavingsPercent}%. Terraform patch generated: ${!!report.terraformPatch}`,
      ],
    };
  }
}

export const economistAgent = Object.freeze(new FinOpsAgent());
