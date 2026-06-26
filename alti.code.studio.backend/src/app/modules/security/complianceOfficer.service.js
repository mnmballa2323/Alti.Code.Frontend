import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * SOC2 / GDPR Compliance Officer
 * Scans codebase and logs for PII leaks, hardcoded secrets, and GDPR violations.
 */
const auditCompliance = async (
  userId,
  sessionId,
  codebaseSnapshot,
  logSample,
) => {
  logger.info(
    `🛡️ [Compliance Officer] Commencing SOC2/GDPR compliance audit...`,
  );

  try {
    const compliancePrompt = `You are an elite SOC2 Auditor and GDPR Data Privacy Lawyer.
Analyze the following application source code and recent server log samples.
Identify ANY instances of:
1. Unencrypted Personally Identifiable Information (PII) at rest or in logs.
2. Missing GDPR data deletion endpoints (Right to be Forgotten).
3. Non-compliant cookie tracking mechanisms.

Codebase: ${codebaseSnapshot.substring(0, 20000)}
Logs: ${logSample.substring(0, 5000)}

Generate a strict compliance audit report, and output the exact code patches required to fix the violations.`;

    const result = await LlmGatewayService.routeCompletion(
      userId,
      sessionId,
      compliancePrompt,
      'gpt-5.5',
      'Compliance-Officer',
    );

    const auditReport = result.reply;
    logger.info(`✅ [Compliance Officer] SOC2/GDPR audit complete.`);

    return { status: 'audit_complete', auditReport };
  } catch (error) {
    logger.error(
      `❌ [Compliance Officer] Compliance audit critically failed:`,
      error,
    );
    throw error;
  }
};

export const ComplianceOfficerService = { auditCompliance };
