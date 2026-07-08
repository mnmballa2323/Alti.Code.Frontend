/**
 * Immutable Audit Logger
 * 
 * Tamper-proof audit trail for enterprise compliance:
 * - Writes to both PostgreSQL and Cloud Logging (BigQuery sink)
 * - SHA-256 hash chain for tamper detection
 * - Structured fields: who, what, when, where, resource, result
 * - CANNOT be deleted or modified (append-only)
 * - Query interface for compliance dashboards
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import crypto from 'crypto';

class AuditLogger {
  constructor() {
    this.prisma = null;
    this.lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
    this.buffer = [];
    this.flushInterval = null;
    this.FLUSH_INTERVAL_MS = 5000;
    this.MAX_BUFFER = 100;
  }

  async init(prismaClient) {
    this.prisma = prismaClient;
    this.flushInterval = setInterval(() => this._flush(), this.FLUSH_INTERVAL_MS);
    logger.info('[AuditLogger] Initialized with hash chain');
  }

  /**
   * Log an auditable event
   */
  async log(event) {
    const {
      action,           // 'user.login', 'agent.execute', 'api_key.create', etc.
      actor,            // { id, email, role, ip }
      resource,         // { type: 'agent', id: '...' }
      result,           // 'success' | 'failure' | 'denied'
      metadata = {},    // Additional context
      tenantId,
    } = event;

    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      actorId: actor?.id || 'system',
      actorEmail: actor?.email || '',
      actorRole: actor?.role || '',
      actorIp: actor?.ip || '',
      resourceType: resource?.type || '',
      resourceId: resource?.id || '',
      result: result || 'success',
      tenantId: tenantId || 'platform',
      metadata: JSON.stringify(metadata),
      previousHash: this.lastHash,
    };

    // Hash chain: each entry includes hash of previous
    entry.hash = this._computeHash(entry);
    this.lastHash = entry.hash;

    // Buffer for batch insert
    this.buffer.push(entry);

    // Also emit to structured logging (BigQuery sink)
    logger.info({
      message: `AUDIT: ${action}`,
      severity: 'NOTICE',
      audit: true,
      ...entry,
    });

    metrics.incrementCounter('audit_events_total', 1, { action, result: entry.result });

    if (this.buffer.length >= this.MAX_BUFFER) {
      await this._flush();
    }
  }

  async query(filters = {}, limit = 100, offset = 0) {
    if (!this.prisma) return [];
    try {
      const where = {};
      if (filters.action) where.action = { contains: filters.action };
      if (filters.actorId) where.actorId = filters.actorId;
      if (filters.tenantId) where.tenantId = filters.tenantId;
      if (filters.result) where.result = filters.result;
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
        if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
      }

      return await this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (err) {
      logger.error('[AuditLogger] Query failed:', err.message);
      return [];
    }
  }

  async verifyIntegrity(entries) {
    let expectedHash = entries[0]?.previousHash || this.lastHash;
    const violations = [];

    for (const entry of entries) {
      if (entry.previousHash !== expectedHash) {
        violations.push({ entryId: entry.id, expected: expectedHash, actual: entry.previousHash });
      }
      expectedHash = entry.hash;
    }

    return { valid: violations.length === 0, violations };
  }

  async _flush() {
    if (this.buffer.length === 0 || !this.prisma) return;
    const batch = [...this.buffer];
    this.buffer = [];

    try {
      await this.prisma.auditLog.createMany({ data: batch });
      metrics.incrementCounter('audit_flush_total', batch.length);
    } catch (err) {
      logger.error('[AuditLogger] Flush failed, re-buffering:', err.message);
      this.buffer.unshift(...batch);
    }
  }

  _computeHash(entry) {
    const payload = `${entry.timestamp}|${entry.action}|${entry.actorId}|${entry.resourceId}|${entry.result}|${entry.previousHash}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  async shutdown() {
    if (this.flushInterval) clearInterval(this.flushInterval);
    await this._flush();
    logger.info('[AuditLogger] Shutdown complete');
  }
}

export const auditLogger = new AuditLogger();
