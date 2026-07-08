import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { auditLogger } from './auditLogger.js';

class DlpScanner {
  constructor() {
    this.initialized = false;
  }

  async init() {
    // Simulate GCP DLP API initialization
    logger.info('[DlpScanner] Initialized in-flight DLP scanner (GCP-style fallback)');
    this.initialized = true;
  }

  async scanAndRedact(text, tenantId) {
    if (!text || typeof text !== 'string') return text;

    let redactedText = text;
    let redactCount = 0;
    const typesRedacted = new Set();

    // 1. Credit Cards: [REDACTED_CREDIT_CARD]
    const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
    redactedText = redactedText.replace(ccRegex, () => {
      redactCount++;
      typesRedacted.add('CREDIT_CARD');
      return '[REDACTED_CREDIT_CARD]';
    });

    // 2. SSNs: [REDACTED_SSN]
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    redactedText = redactedText.replace(ssnRegex, () => {
      redactCount++;
      typesRedacted.add('SSN');
      return '[REDACTED_SSN]';
    });

    // 3. API Keys/Secrets: [REDACTED_SECRET]
    const secretRegex = /(?:api[_-]?key|secret|token)[\s:=]+['"]?([a-zA-Z0-9\-_]{16,})['"]?/gi;
    redactedText = redactedText.replace(secretRegex, (match, p1) => {
      redactCount++;
      typesRedacted.add('SECRET');
      return match.replace(p1, '[REDACTED_SECRET]');
    });

    const bearerRegex = /Bearer\s+([a-zA-Z0-9\-._~+/]+=*)/gi;
    redactedText = redactedText.replace(bearerRegex, (match, p1) => {
      redactCount++;
      typesRedacted.add('SECRET');
      return match.replace(p1, '[REDACTED_SECRET]');
    });

    if (redactCount > 0) {
      metrics.incrementCounter('security.dlp.redacted_events', redactCount, { tenantId });
      auditLogger.log({
        action: 'security.dlp.redacted',
        tenantId,
        metadata: {
          count: redactCount,
          types: Array.from(typesRedacted)
        }
      });
      logger.info(`[DlpScanner] Redacted ${redactCount} items for tenant ${tenantId}`);
    }

    return redactedText;
  }
}

export const dlpScanner = new DlpScanner();
