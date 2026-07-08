/**
 * Health Aggregator
 * 
 * Combines health checks from all services into unified endpoints:
 * - /healthz (liveness)
 * - /readyz (readiness)
 * - /api/v1/health (detailed)
 */

import { database } from './database.js';
import { cacheStrategy } from './cacheStrategy.js';
import { breakers } from './circuitBreaker.js';
import { serviceRegistry } from './serviceRegistry.js';
import { sessionSync } from './sessionSync.js';
import { tenantManager } from './tenantManager.js';
import { metrics } from './metrics.js';

class HealthAggregator {
  async liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async readiness() {
    const checks = {
      database: await this._checkDatabase(),
      cache: this._checkCache(),
      services: serviceRegistry.initialized ? 'ready' : 'initializing',
    };

    const allReady = Object.values(checks).every(
      c => c === 'ready' || c === 'ok' || c?.status === 'healthy'
    );

    return {
      status: allReady ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  async detailed() {
    const [dbHealth, dbStats] = await Promise.all([
      this._checkDatabase(),
      database.getStats(),
    ]);

    const circuitBreakerStates = {};
    for (const [name, breaker] of Object.entries(breakers)) {
      circuitBreakerStates[name] = breaker.getState();
    }

    const presence = sessionSync.getPresence();
    const tenantStats = tenantManager.getStats();
    const cacheStats = cacheStrategy.getStats();
    const registryStatus = serviceRegistry.getStatus();

    return {
      status: dbHealth?.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: registryStatus.uptimeMs,
      version: process.env.APP_VERSION || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      region: process.env.GCP_REGION || 'us-central1',
      services: {
        database: { health: dbHealth, stats: dbStats },
        cache: cacheStats,
        circuitBreakers: circuitBreakerStates,
        sessions: presence,
        tenants: tenantStats,
        serviceRegistry: {
          serviceCount: registryStatus.serviceCount,
          initialized: registryStatus.initialized,
        },
      },
      node: {
        version: process.version,
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
      },
    };
  }

  async _checkDatabase() {
    try {
      return await database.healthCheck();
    } catch {
      return { status: 'unreachable' };
    }
  }

  _checkCache() {
    const stats = cacheStrategy.getStats();
    return stats.redisAvailable ? 'ready' : 'fallback';
  }
}

export const healthAggregator = new HealthAggregator();
