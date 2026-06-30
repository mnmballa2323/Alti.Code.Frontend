/**
 * Copyright (c) 2024 Inso Code
 *
 * Advanced AI-driven anomaly detection for Enterprise Audit Logs.
 * Integrates directly with Google Cloud Vertex AI to identify insider threats
 * and behavioral deviations based on audit ledger trails.
 */

import { multiCloudInferenceService } from '../ai/multicloud_inference.service.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { AuditLog } from './audit.model.js';

class AuditAnomalyService {
  constructor() {
    this.projectId = config.azure.tenant_id;
    this.location = 'eastus';
    this.modelName = config.azure.model_name || 'gpt-5.4'; // Use primary analytical model

    try {
      this.isEnabled = true;
      logger.info('🤖 AuditAnomalyService: Initialized with Azure OpenAI.');
    } catch (error) {
      this.isEnabled = false;
      logger.error(
        '❌ AuditAnomalyService: Azure OpenAI initialization failed.',
        error.message,
      );
    }
  }

  /**
   * Analyze a user's recent activity for behavioral anomalies.
   * Generates a Threat Score and explanation.
   * @param {string} actor The user or system agent identifier
   * @returns {Object} Anomaly report { threatScore: number, isAnomaly: boolean, reason: string }
   */
  async evaluateActorBehavior(actor) {
    if (!this.isEnabled) {
      return { threatScore: 0, isAnomaly: false, reason: 'Vertex AI Disabled' };
    }

    try {
      // Fetch the last 100 actions for this actor to establish context
      const recentLogs = await AuditLog.find({ actor })
        .sort({ timestamp: -1 })
        .limit(100)
        .select('action status metadata timestamp ipAddress')
        .lean();

      if (recentLogs.length < 5) {
        return {
          threatScore: 0,
          isAnomaly: false,
          reason: 'Insufficient data for behavioral baseline.',
        };
      }

      const prompt = `
            You are an elite enterprise SecOps AI. You are reviewing the access and audit logs for a user named "${actor}".
            Analyze their recent behavior for anomalies, insider threat indicators, or compromised account symptoms.
            (e.g., sudden massive data exports, continuous DENIED requests, unusual IPs, privilege escalation attempts).

            Recent Logs (JSONL format):
            ${recentLogs.map(log => JSON.stringify(log)).join('\n')}

            Evaluate the behavior and respond WITH VALID JSON ONLY using the precise schema:
            {
                "threatScore": number (0-100, where > 75 is critical),
                "isAnomaly": boolean (true if threatScore > 75),
                "reason": "String detailing exactly what anomalous behavior was detected, or 'Behavior normal' if safe"
            }`;

      const result =
        await multiCloudInferenceService.executeMultiCloudInference(
          prompt,
          'audit_anomaly',
          { modelId: 'gpt-5.4' },
        );
      const responseText = result.content;

      // Clean up any markdown blocks if the LLM adds them
      const jsonStr = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const analysis = JSON.parse(jsonStr);

      if (analysis.isAnomaly) {
        logger.warn(
          `🚨 Anomaly Detected for ${actor}: Score ${analysis.threatScore} - ${analysis.reason}`,
        );

        // Optionally push to PubSub if it's high severity
        if (analysis.threatScore >= 90) {
          const { auditService } = await import('./audit.service.js');
          await auditService.logAction(
            'system_vertex_ai',
            'BEHAVIORAL_ANOMALY',
            analysis,
            'CRITICAL',
          );
        }
      }

      return analysis;
    } catch (error) {
      logger.error(
        `❌ AuditAnomalyService: Failed to evaluate behavior for ${actor}`,
        error.message,
      );
      return {
        threatScore: -1,
        isAnomaly: false,
        reason: 'Analysis failed due to an internal error.',
      };
    }
  }
}

export const auditAnomalyService = new AuditAnomalyService();
