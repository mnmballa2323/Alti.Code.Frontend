/**
 * Structured Logger for Cloud Logging Integration
 * 
 * Outputs JSON logs with Cloud Logging special fields:
 * - severity (mapped from log level)
 * - logging.googleapis.com/trace (trace context)
 * - logging.googleapis.com/spanId
 * - httpRequest (request metadata)
 * - labels (custom key-value pairs)
 */

import { logger } from './logger.js';
import crypto from 'crypto';

class StructuredLogger {
  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID;
    this.serviceName = process.env.SERVICE_NAME || 'alti-backend';
    this.version = process.env.SERVICE_VERSION || '2.0.0';
  }

  /**
   * Create a request-scoped logger that auto-attaches trace context
   */
  forRequest(req) {
    const requestId = req.headers['x-request-id'] || req.id || crypto.randomUUID();
    const traceHeader = req.headers['x-cloud-trace-context'];
    let trace = null;
    let spanId = null;

    if (traceHeader && this.projectId) {
      const [traceId, span] = traceHeader.split('/');
      trace = `projects/${this.projectId}/traces/${traceId}`;
      spanId = span?.split(';')[0];
    }

    return {
      info: (message, data = {}) => this._log('INFO', message, { requestId, trace, spanId, userId: req.user?.id, ...data }),
      warn: (message, data = {}) => this._log('WARNING', message, { requestId, trace, spanId, userId: req.user?.id, ...data }),
      error: (message, data = {}) => this._log('ERROR', message, { requestId, trace, spanId, userId: req.user?.id, ...data }),
      debug: (message, data = {}) => this._log('DEBUG', message, { requestId, trace, spanId, userId: req.user?.id, ...data }),
    };
  }

  /**
   * Log with structured JSON format
   */
  _log(severity, message, context = {}) {
    const entry = {
      severity,
      message,
      timestamp: new Date().toISOString(),
      'logging.googleapis.com/labels': {
        service: this.serviceName,
        version: this.version,
      },
    };

    // Attach trace context (enables log-to-trace correlation in Cloud Console)
    if (context.trace) {
      entry['logging.googleapis.com/trace'] = context.trace;
    }
    if (context.spanId) {
      entry['logging.googleapis.com/spanId'] = context.spanId;
    }

    // Attach request ID
    if (context.requestId) {
      entry.requestId = context.requestId;
    }

    // Attach user context
    if (context.userId) {
      entry.userId = context.userId;
    }

    // Attach any additional data
    const { requestId, trace, spanId, userId, ...rest } = context;
    if (Object.keys(rest).length > 0) {
      entry.data = rest;
    }

    // In production, output pure JSON for Cloud Logging agent
    if (process.env.NODE_ENV === 'production') {
      const logFn = severity === 'ERROR' ? console.error : severity === 'WARNING' ? console.warn : console.log;
      logFn(JSON.stringify(entry));
    } else {
      // In development, use the existing Winston logger for pretty output
      const level = severity === 'WARNING' ? 'warn' : severity.toLowerCase();
      logger[level]?.(message, context) || logger.info(message, context);
    }
  }

  info(message, data = {}) { this._log('INFO', message, data); }
  warn(message, data = {}) { this._log('WARNING', message, data); }
  error(message, data = {}) { this._log('ERROR', message, data); }
  debug(message, data = {}) { this._log('DEBUG', message, data); }
}

export const structuredLogger = new StructuredLogger();
