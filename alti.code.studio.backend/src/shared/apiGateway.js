/**
 * Enterprise API Gateway
 * 
 * Production-grade API middleware:
 * - API key authentication (for external integrations)
 * - Request/response logging
 * - Request ID tracking (X-Request-ID)
 * - Response envelope standardization
 * - API versioning (v1, v2)
 * - Tenant isolation
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { auditLogger } from './auditLogger.js';
import crypto from 'crypto';

class ApiGateway {
  constructor() {
    this.apiKeys = new Map(); // In production, backed by Secret Manager
  }

  /**
   * Request ID middleware
   */
  requestId() {
    return (req, res, next) => {
      req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
      res.setHeader('X-Request-ID', req.requestId);
      next();
    };
  }

  /**
   * API key authentication middleware
   */
  apiKeyAuth() {
    return async (req, res, next) => {
      const apiKey = req.headers['x-api-key'];
      if (!apiKey) {
        return res.status(401).json(this.errorEnvelope('API key required', 'UNAUTHORIZED', req.requestId));
      }

      const keyData = await this._validateApiKey(apiKey);
      if (!keyData) {
        metrics.incrementCounter('api_auth_failures', 1);
        return res.status(403).json(this.errorEnvelope('Invalid API key', 'FORBIDDEN', req.requestId));
      }

      req.apiKeyData = keyData;
      req.tenantId = keyData.tenantId;
      metrics.incrementCounter('api_auth_success', 1, { tenant: keyData.tenantId });
      next();
    };
  }

  /**
   * Standard response envelope
   */
  successEnvelope(data, meta = {}) {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  errorEnvelope(message, code = 'ERROR', requestId = null) {
    return {
      success: false,
      error: {
        message,
        code,
        requestId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  paginatedEnvelope(data, total, page, limit) {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };
  }

  /**
   * Request logging middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      const originalEnd = res.end;

      res.end = function(...args) {
        const duration = Date.now() - start;
        const logEntry = {
          requestId: req.requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: duration,
          tenantId: req.tenantId || 'anonymous',
          userAgent: req.headers['user-agent']?.substring(0, 100),
          ip: req.headers['x-forwarded-for'] || req.ip,
        };

        if (res.statusCode >= 400) {
          logger.warn({ message: 'API request failed', ...logEntry });
        } else {
          logger.info({ message: 'API request', ...logEntry });
        }

        metrics.recordHistogram('api_request_duration_ms', duration, {
          method: req.method,
          path: req.route?.path || req.originalUrl,
          status: String(res.statusCode),
        });

        originalEnd.apply(res, args);
      };

      next();
    };
  }

  /**
   * Register API key (for management)
   */
  async registerApiKey(tenantId, name, scopes = ['read']) {
    const key = `alti_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
    this.apiKeys.set(hashedKey, { tenantId, name, scopes, createdAt: new Date().toISOString() });

    await auditLogger.log({
      action: 'api_key.create',
      actor: { id: 'system' },
      resource: { type: 'api_key', id: name },
      result: 'success',
      tenantId,
    });

    return { key, name, scopes }; // Only return unhashed key once
  }

  async _validateApiKey(key) {
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
    return this.apiKeys.get(hashedKey) || null;
  }
}

export const apiGateway = new ApiGateway();
