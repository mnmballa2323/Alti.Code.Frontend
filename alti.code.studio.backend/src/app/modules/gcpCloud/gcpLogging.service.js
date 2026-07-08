import { Logging } from '@google-cloud/logging';
import { logger } from '../../../shared/logger.js';

/**
 * Valid Cloud Logging severity levels.
 * @see https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
 */
const SEVERITY_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  NOTICE: 'NOTICE',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
  ALERT: 'ALERT',
  EMERGENCY: 'EMERGENCY',
};

/** Map common aliases to canonical severities */
const SEVERITY_ALIASES = {
  warn: 'WARNING',
  err: 'ERROR',
  crit: 'CRITICAL',
  fatal: 'EMERGENCY',
};

/**
 * Normalise a severity string to a valid Cloud Logging severity.
 * @param {string} input
 * @returns {string}
 */
function normaliseSeverity(input) {
  const upper = (input || 'DEFAULT').toUpperCase();
  return SEVERITY_LEVELS[upper] || SEVERITY_ALIASES[input?.toLowerCase()] || upper;
}

class GcpLoggingServiceImpl {
  constructor() {
    this.logging = null;
    this.isInitialized = false;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT || null;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.logging = new Logging();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Logging initialization failed, falling back to local logger: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Write an audit entry to Google Cloud Logging or fallback logger
   * @param {string} logName - Name of the log
   * @param {object} entry - The audit data
   * @param {string} severity - NOTICE, INFO, WARNING, ERROR, CRITICAL
   */
  async writeAuditLog(logName, entry, severity = 'NOTICE') {
    const timestamp = new Date().toISOString();
    const payload = {
      ...entry,
      platform: 'Alti.Code.Studio',
      cloudProvider: 'Google Cloud Platform',
      deploymentType: process.env.GCP_DEPLOYMENT_TYPE || 'commercial',
      timestamp,
    };

    if (this.isInitialized && this.logging) {
      try {
        const log = this.logging.log(logName);
        const metadata = {
          resource: { type: 'global' },
          severity: severity.toUpperCase(),
        };
        const logEntry = log.entry(metadata, payload);
        await log.write(logEntry);
        return;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Logging write failed: ${e.message}. Falling back to standard console logger.`,
        );
      }
    }

    // Console Logger Fallback
    logger.info(
      `[GCP Audit Log] [${severity}] ${logName}: ${JSON.stringify(payload)}`,
    );
  }

  /**
   * Write a structured JSON log entry to Google Cloud Logging.
   *
   * Supports Cloud Trace correlation, HTTP request metadata, and
   * arbitrary key/value labels, producing entries that integrate with
   * the Cloud Logging "Structured Logging" viewer.
   *
   * @param {string} severity  - One of DEBUG, INFO, WARNING, ERROR, CRITICAL (or aliases)
   * @param {string} message   - Human-readable message
   * @param {object} [metadata={}] - Additional structured fields:
   * @param {object} [metadata.httpRequest]  - HTTP request data for request-log correlation
   * @param {string} [metadata.httpRequest.requestMethod]
   * @param {string} [metadata.httpRequest.requestUrl]
   * @param {number} [metadata.httpRequest.status]
   * @param {number} [metadata.httpRequest.latency]    - Response time in ms
   * @param {string} [metadata.httpRequest.userAgent]
   * @param {string} [metadata.httpRequest.remoteIp]
   * @param {string} [metadata.traceId]     - Cloud Trace trace ID (hex string)
   * @param {string} [metadata.spanId]      - Cloud Trace span ID (hex string)
   * @param {object} [metadata.labels]      - Arbitrary key/value labels
   * @param {string} [metadata.logName]     - Cloud Logging log name (default: 'structured-app-log')
   */
  async writeStructuredLog(severity, message, metadata = {}) {
    const canonicalSeverity = normaliseSeverity(severity);
    const logName = metadata.logName || 'structured-app-log';
    const timestamp = new Date().toISOString();

    // Build the JSON payload for Cloud Logging structured log format
    const jsonPayload = {
      message,
      severity: canonicalSeverity,
      timestamp,
      serviceContext: {
        service: 'alti-code-studio-backend',
        version: process.env.APP_VERSION || '1.0.0',
      },
      ...(metadata.labels && { 'logging.googleapis.com/labels': metadata.labels }),
    };

    // Build the entry metadata
    const entryMetadata = {
      resource: { type: 'global' },
      severity: canonicalSeverity,
    };

    // Cloud Trace correlation
    // Format: projects/PROJECT_ID/traces/TRACE_ID
    if (metadata.traceId && this.projectId) {
      entryMetadata.trace = `projects/${this.projectId}/traces/${metadata.traceId}`;
      jsonPayload['logging.googleapis.com/trace'] = entryMetadata.trace;
    }
    if (metadata.spanId) {
      entryMetadata.spanId = metadata.spanId;
      jsonPayload['logging.googleapis.com/spanId'] = metadata.spanId;
    }

    // HTTP request correlation
    if (metadata.httpRequest) {
      const hr = metadata.httpRequest;
      entryMetadata.httpRequest = {
        requestMethod: hr.requestMethod || hr.method,
        requestUrl: hr.requestUrl || hr.url,
        status: hr.status,
        userAgent: hr.userAgent,
        remoteIp: hr.remoteIp,
        ...(hr.latency != null && {
          latency: { seconds: Math.floor(hr.latency / 1000), nanos: (hr.latency % 1000) * 1e6 },
        }),
      };
    }

    // Merge any extra fields the caller supplied (excluding reserved keys)
    const reserved = new Set([
      'httpRequest', 'traceId', 'spanId', 'labels', 'logName',
    ]);
    for (const [key, value] of Object.entries(metadata)) {
      if (!reserved.has(key)) {
        jsonPayload[key] = value;
      }
    }

    // Attempt Cloud Logging write
    if (this.isInitialized && this.logging) {
      try {
        const log = this.logging.log(logName);
        const entry = log.entry(entryMetadata, jsonPayload);
        await log.write(entry);
        return;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Logging (structured) write failed: ${e.message}. Falling back to local logger.`,
        );
      }
    }

    // Fallback: structured JSON to stdout (Cloud Run / GKE auto-ingests these)
    const fallback = {
      ...jsonPayload,
      ...(entryMetadata.trace && { 'logging.googleapis.com/trace': entryMetadata.trace }),
      ...(entryMetadata.httpRequest && { httpRequest: entryMetadata.httpRequest }),
    };

    const localMethod = ['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'].includes(canonicalSeverity)
      ? 'error'
      : canonicalSeverity === 'WARNING'
        ? 'warn'
        : canonicalSeverity === 'DEBUG'
          ? 'debug'
          : 'info';

    logger[localMethod](
      `[GCP Structured Log] [${canonicalSeverity}] ${message} ${JSON.stringify(fallback)}`,
    );
  }
}

const service = new GcpLoggingServiceImpl();

export const GcpLoggingServiceInstance = {
  writeAuditLog: (logName, entry, severity) =>
    service.writeAuditLog(logName, entry, severity),
  writeStructuredLog: (severity, message, metadata) =>
    service.writeStructuredLog(severity, message, metadata),
};

export const CloudLoggingService = GcpLoggingServiceInstance;
export const GcpLoggingService = GcpLoggingServiceInstance;
export const gcpLoggingService = GcpLoggingServiceInstance;
