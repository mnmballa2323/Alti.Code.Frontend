/**
 * Production Database Manager
 * 
 * Wraps PrismaClient with:
 * - Connection pool configuration optimized for Cloud Run
 * - Health check queries
 * - Query timing metrics
 * - Graceful shutdown
 * - Automatic retry with exponential backoff
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { metrics } from './metrics.js';

class DatabaseManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
  }

  async init() {
    if (this.client) return this.client;

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      logger.warn('[Database] DATABASE_URL not set — skipping initialization');
      return null;
    }

    // Optimize connection URL for Cloud Run with PgBouncer
    const connectionUrl = this._optimizeConnectionUrl(dbUrl);

    this.client = new PrismaClient({
      datasources: {
        db: { url: connectionUrl },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Track query performance
    this.client.$on('query', (e) => {
      metrics.recordHistogram('db_query_duration_ms', e.duration, {
        operation: e.query?.split(' ')[0] || 'unknown',
      });
      if (e.duration > 1000) {
        logger.warn(`[Database] Slow query (${e.duration}ms): ${e.query?.substring(0, 100)}`);
      }
    });

    this.client.$on('error', (e) => {
      logger.error('[Database] Prisma error:', e.message);
      metrics.incrementCounter('db_errors_total', 1);
    });

    await this._connectWithRetry();
    return this.client;
  }

  async _connectWithRetry() {
    while (this.connectionAttempts < this.maxRetries) {
      try {
        await this.client.$connect();
        this.isConnected = true;
        this.connectionAttempts = 0;
        logger.info('[Database] Connected to PostgreSQL');
        return;
      } catch (err) {
        this.connectionAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000);
        logger.warn(`[Database] Connection attempt ${this.connectionAttempts}/${this.maxRetries} failed, retrying in ${delay}ms:`, err.message);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    logger.error('[Database] Failed to connect after maximum retries');
    this.isConnected = false;
  }

  _optimizeConnectionUrl(url) {
    const u = new URL(url);
    // Cloud Run best practices for PgBouncer
    if (!u.searchParams.has('connection_limit')) {
      u.searchParams.set('connection_limit', '10');
    }
    if (!u.searchParams.has('pool_timeout')) {
      u.searchParams.set('pool_timeout', '10');
    }
    // Enable pgbouncer mode if using Cloud SQL Proxy
    if (process.env.USE_PGBOUNCER === 'true' && !u.searchParams.has('pgbouncer')) {
      u.searchParams.set('pgbouncer', 'true');
    }
    return u.toString();
  }

  async healthCheck() {
    if (!this.client) return { status: 'not_initialized' };
    try {
      const start = Date.now();
      await this.client.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      metrics.recordHistogram('db_health_check_ms', latency);
      return { status: 'healthy', latencyMs: latency };
    } catch (err) {
      return { status: 'unhealthy', error: err.message };
    }
  }

  async getStats() {
    if (!this.client) return null;
    try {
      const result = await this.client.$queryRaw`
        SELECT 
          numbackends as active_connections,
          xact_commit as transactions_committed,
          xact_rollback as transactions_rolled_back,
          blks_read as blocks_read,
          blks_hit as blocks_hit,
          tup_returned as rows_returned,
          tup_inserted as rows_inserted,
          tup_updated as rows_updated,
          tup_deleted as rows_deleted,
          pg_database_size(current_database()) as database_size_bytes
        FROM pg_stat_database 
        WHERE datname = current_database()
      `;
      return result[0] || null;
    } catch {
      return null;
    }
  }

  async shutdown() {
    if (this.client) {
      logger.info('[Database] Disconnecting...');
      await this.client.$disconnect();
      this.isConnected = false;
      logger.info('[Database] Disconnected');
    }
  }

  getClient() {
    return this.client;
  }
}

export const database = new DatabaseManager();
