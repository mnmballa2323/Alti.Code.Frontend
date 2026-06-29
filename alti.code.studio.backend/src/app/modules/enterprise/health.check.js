/**
 * Copyright (c) 2024 Inso Code
 *
 * HEALTH CHECK & READINESS PROBES (Phase 54)
 *
 * Kubernetes-compatible health probes:
 *   - /healthz  — Liveness: is the process alive?
 *   - /readyz   — Readiness: can the service handle requests?
 *   - /livez    — Deep liveness: all critical paths functional
 *   - Dependency health matrix (database, cache, queue, etc.)
 *   - Graceful degradation reporting
 *   - Startup probe tracking
 *   - Custom health check registration
 */

import { logger } from '../../../shared/logger.js';

// ═══════════════════════════════════════════════
// Health Constants
// ═══════════════════════════════════════════════

const HEALTH_STATUSES = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  UNHEALTHY: 'UNHEALTHY',
  UNKNOWN: 'UNKNOWN',
};

const DEFAULT_DEPENDENCIES = {
  database: { required: true, timeout: 5000, status: 'HEALTHY', latency: 0 },
  cache: { required: false, timeout: 3000, status: 'HEALTHY', latency: 0 },
  queue: { required: false, timeout: 3000, status: 'HEALTHY', latency: 0 },
  storage: { required: false, timeout: 5000, status: 'HEALTHY', latency: 0 },
  auth: { required: true, timeout: 5000, status: 'HEALTHY', latency: 0 },
  search: { required: false, timeout: 3000, status: 'HEALTHY', latency: 0 },
  external_api: {
    required: false,
    timeout: 10000,
    status: 'HEALTHY',
    latency: 0,
  },
};

// ═══════════════════════════════════════════════
// Health Check Engine
// ═══════════════════════════════════════════════

class HealthCheckEngine {
  constructor() {
    this.startedAt = new Date().toISOString();
    this.ready = false;
    this.dependencies = JSON.parse(JSON.stringify(DEFAULT_DEPENDENCIES));
    this.customChecks = new Map();
    this.history = [];
    this.checkCount = 0;

    // Auto-ready after initialization
    setTimeout(() => {
      this.ready = true;
    }, 0);

    if (process.env.NODE_ENV !== 'test') {
      this.intervalId = setInterval(() => {
        this.runRealHealthChecks().catch(() => {});
      }, 15000);
      setTimeout(() => {
        this.runRealHealthChecks().catch(() => {});
      }, 1000);
    }
  }

  async runRealHealthChecks() {
    // 1. Check database (PostgreSQL)
    try {
      const { prisma } = await import('../../../config/prisma.js');
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      this.setDependencyStatus('database', 'HEALTHY', Date.now() - start);
    } catch (err) {
      this.setDependencyStatus('database', 'UNHEALTHY', 0);
    }

    // 2. Check cache (Redis/Memorystore)
    if (process.env.DISABLE_REDIS === 'true') {
      this.setDependencyStatus('cache', 'HEALTHY', 0);
    } else {
      try {
        const { gcpCacheService } =
          await import('../gcpCloud/gcpCache.service.js');
        if (
          gcpCacheService &&
          gcpCacheService.publisher &&
          gcpCacheService.publisher.status === 'ready'
        ) {
          const start = Date.now();
          await gcpCacheService.publisher.ping();
          this.setDependencyStatus('cache', 'HEALTHY', Date.now() - start);
        } else {
          this.setDependencyStatus('cache', 'UNHEALTHY', 0);
        }
      } catch (err) {
        this.setDependencyStatus('cache', 'UNHEALTHY', 0);
      }
    }
  }

  // ── Liveness Probe ──

  healthz() {
    this.checkCount++;
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: this._getUptime(),
      version: process.env.APP_VERSION || '3.1.0',
      pid: process.pid,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };
  }

  // ── Readiness Probe ──

  readyz() {
    this.checkCount++;
    const deps = this._checkDependencies();
    const allRequiredHealthy = deps.every(
      d => !d.required || d.status === 'HEALTHY',
    );

    return {
      status: this.ready && allRequiredHealthy ? 'READY' : 'NOT_READY',
      timestamp: new Date().toISOString(),
      checks: deps,
      ready: this.ready && allRequiredHealthy,
    };
  }

  // ── Deep Liveness ──

  livez() {
    this.checkCount++;
    const deps = this._checkDependencies();
    const customResults = this._runCustomChecks();

    const overallStatus = this._computeOverallStatus(deps, customResults);

    const result = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: this._getUptime(),
      dependencies: deps,
      customChecks: customResults,
      degradedServices: deps
        .filter(d => d.status !== 'HEALTHY')
        .map(d => d.name),
    };

    this._recordCheck(result);
    return result;
  }

  // ── Dependency Management ──

  setDependencyStatus(name, status, latency = 0) {
    if (!this.dependencies[name]) {
      this.dependencies[name] = {
        required: false,
        timeout: 5000,
        status,
        latency,
      };
    } else {
      this.dependencies[name].status = status;
      this.dependencies[name].latency = latency;
    }
    this.dependencies[name].lastChecked = new Date().toISOString();

    if (status !== 'HEALTHY') {
      logger.warn(`⚠️ Dependency ${name} is ${status}`);
    }

    return { name, status, latency };
  }

  registerCheck(name, checkFn) {
    this.customChecks.set(name, checkFn);
    return { registered: name };
  }

  // ── Startup Probe ──

  startupz() {
    return {
      started: true,
      startedAt: this.startedAt,
      ready: this.ready,
      uptime: this._getUptime(),
    };
  }

  // ── Dependency Health Matrix ──

  getDependencyMatrix() {
    return Object.entries(this.dependencies).map(([name, dep]) => ({
      name,
      status: dep.status,
      required: dep.required,
      latency: dep.latency,
      timeout: dep.timeout,
      lastChecked: dep.lastChecked || null,
      healthy: dep.status === 'HEALTHY',
    }));
  }

  // ── History ──

  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  // ── Internal ──

  _checkDependencies() {
    return Object.entries(this.dependencies).map(([name, dep]) => ({
      name,
      status: dep.status,
      required: dep.required,
      latency: dep.latency,
    }));
  }

  _runCustomChecks() {
    const results = [];
    for (const [name, checkFn] of this.customChecks) {
      try {
        const result = checkFn();
        results.push({ name, status: result ? 'PASS' : 'FAIL' });
      } catch (err) {
        results.push({ name, status: 'ERROR', error: err.message });
      }
    }
    return results;
  }

  _computeOverallStatus(deps, customResults) {
    const requiredDown = deps.some(d => d.required && d.status !== 'HEALTHY');
    if (requiredDown) return HEALTH_STATUSES.UNHEALTHY;

    const anyDegraded =
      deps.some(d => d.status !== 'HEALTHY') ||
      customResults.some(c => c.status !== 'PASS');
    if (anyDegraded) return HEALTH_STATUSES.DEGRADED;

    return HEALTH_STATUSES.HEALTHY;
  }

  _getUptime() {
    const ms = Date.now() - new Date(this.startedAt).getTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return { hours, minutes: minutes % 60, seconds: seconds % 60, ms };
  }

  _recordCheck(result) {
    this.history.push({
      status: result.status,
      timestamp: result.timestamp,
      degraded: result.degradedServices.length,
    });
    if (this.history.length > 100) this.history.shift();
  }

  getStats() {
    return {
      totalChecks: this.checkCount,
      uptime: this._getUptime(),
      startedAt: this.startedAt,
      ready: this.ready,
      dependencies: Object.keys(this.dependencies).length,
      customChecks: this.customChecks.size,
      healthyDeps: Object.values(this.dependencies).filter(
        d => d.status === 'HEALTHY',
      ).length,
    };
  }
}

export const healthCheck = new HealthCheckEngine();
export { HEALTH_STATUSES, DEFAULT_DEPENDENCIES };

/**
 * Wire VectorMemory.embeddingCacheStats() into the health check engine.
 * Called once at startup (e.g., in the app bootstrap or server init).
 *
 * Registers two custom checks:
 *  1. `embeddingCache`        — passes if cache utilization < 90%
 *  2. `swarmHealth`           — delegates to swarmHealthMonitor.getReport()
 *
 * @returns {void}
 */
export async function registerSystemHealthChecks() {
  try {
    const { VectorMemory } = await import('../../shared/memory.js');
    healthCheck.registerCheck('embeddingCache', () => {
      const stats = VectorMemory.embeddingCacheStats();
      // Expose stats on the check result via a side effect on the engine stats map
      healthCheck._lastCacheStats = stats;
      return stats.utilizationPct < 90;
    });
    logger.info('🟢 HealthCheck: embeddingCache check registered.');
  } catch (err) {
    logger.warn(
      '🟡 HealthCheck: embeddingCache check not registered (VectorMemory unavailable):',
      err.message,
    );
  }

  try {
    const { swarmHealthMonitor } = await import('../agents/swarm.health.js');
    healthCheck.registerCheck('swarmHealth', () => {
      const report = swarmHealthMonitor.getReport();
      return report.summary.degraded === 0;
    });
    logger.info('🟢 HealthCheck: swarmHealth check registered.');
  } catch (err) {
    logger.warn(
      '🟡 HealthCheck: swarmHealth check not registered (swarmHealthMonitor unavailable):',
      err.message,
    );
  }
}
