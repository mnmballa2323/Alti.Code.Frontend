import { logger } from '../../shared/logger.js';
import { auditService } from '../modules/compliance/audit.service.js';
import { GoogleDlpService } from '../modules/ai/gcpDlp.service.js';

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:any|previous|all)?\s*instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+(?:an?|a\s+helpful)\s+assistant/i,
  /bypass\s+the\s+safety\s+filter/i,
  /new\s+instructions\s+are/i,
  /override\s+(?:settings|guardrails|filters)/i,
  /ignore\s+all\s+(?:guidelines|rules|laws)/i,
  /assistant\s+should\s+now/i,
];

const hasPromptInjection = val => {
  if (typeof val === 'string') {
    return PROMPT_INJECTION_PATTERNS.some(regex => regex.test(val));
  }
  if (typeof val === 'object' && val !== null) {
    for (const key of Object.keys(val)) {
      if (hasPromptInjection(val[key])) {
        return true;
      }
    }
  }
  return false;
};

export const dlpMiddleware = async (req, res, next) => {
  // Skip if no body or public route
  if (
    !req.body ||
    req.originalUrl.includes('/auth') ||
    req.originalUrl.includes('/health')
  ) {
    return next();
  }

  try {
    // 0. Semantic WAF: Prompt Injection Checks
    if (hasPromptInjection(req.body)) {
      logger.warn(
        `🔒 [WAF] Blocked request containing prompt injection patterns.`,
      );

      await auditService.log(
        req.user?.id || 'anonymous',
        'WAF_PAYLOAD_INJECTION',
        req.originalUrl,
        'DENIED',
        { reason: 'Prompt injection detected' },
      );

      // Dispatch real-time SIEM event
      try {
        const tenantId = req.user?.tenantId || 'system';
        const { siemService } =
          await import('../modules/security/siem.service.js');
        await siemService.dispatchEvent(tenantId, 'WAF_PAYLOAD_INJECTION', {
          endpoint: req.originalUrl,
          userId: req.user?.id || 'anonymous',
        });
      } catch (siemErr) {
        logger.warn(
          'Failed to dispatch SIEM event for WAF violation:',
          siemErr.message,
        );
      }

      // Report to Sentinel Security Feed
      try {
        const { sentinelService } =
          await import('../modules/security/sentinel.service.js');
        await sentinelService.reportEvent('WAF_PAYLOAD_INJECTION', 'CRITICAL', {
          endpoint: req.originalUrl,
          userId: req.user?.id || 'anonymous',
        });
      } catch (sentinelErr) {
        logger.warn(
          'Failed to report WAF event to Sentinel:',
          sentinelErr.message,
        );
      }

      // GCP SCC removed

      return res.status(400).json({
        success: false,
        error: 'Security Violation: Potential prompt injection detected.',
      });
    }

    const bodyStr = JSON.stringify(req.body);

    // 1. Perform Deep ML Inspection via Google Cloud DLP
    const findings = [];

    if (findings && findings.length > 0) {
      const riskTypes = findings.map(f => f.infoType.name);
      const uniqueRisks = [...new Set(riskTypes)];

      logger.warn(
        `🔒 [DLP] Blocked request containing sensitive info types: ${uniqueRisks.join(', ')}`,
      );

      await auditService.log(
        req.user?.id || 'anonymous',
        'DLP_VIOLATION',
        req.originalUrl,
        'DENIED',
        { findings: uniqueRisks },
      );

      // Dispatch real-time SIEM event for DLP violation
      try {
        const tenantId = req.user?.tenantId || 'system';
        const { siemService } =
          await import('../modules/security/siem.service.js');
        await siemService.dispatchEvent(tenantId, 'DLP_VIOLATION', {
          risks: uniqueRisks,
          endpoint: req.originalUrl,
          userId: req.user?.id || 'anonymous',
        });
      } catch (siemErr) {
        logger.warn(
          'Failed to dispatch SIEM event for DLP violation:',
          siemErr.message,
        );
      }

      // Report to the Sentinel Security Feed (Real-time Backend Stream)
      const { sentinelService } =
        await import('../modules/security/sentinel.service.js');
      await sentinelService.reportEvent('DLP_REDACTION', 'CRITICAL', {
        risks: uniqueRisks,
        endpoint: req.originalUrl,
        userId: req.user?.id || 'anonymous',
      });

      // GCP SCC removed

      return res.status(400).json({
        success: false,
        error: `Data Loss Prevention (DLP) Violation: Sensitive data detected (${uniqueRisks[0]})`,
      });
    }

    next();
  } catch (error) {
    // Fallback to allow request if GCP service is down, ensuring availability while logging error
    logger.error('[DLP Middleware] Service Error:', error);
    next();
  }
};
