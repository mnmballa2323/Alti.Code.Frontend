import { logger } from '../../../shared/logger.js';

class GcpHealthCheckService {
  constructor() {
    this.startTime = Date.now();
    this.projectId = process.env.GCP_PROJECT_ID || 'unknown';
    this.region = process.env.GCP_REGION || 'us-central1';
    this.deploymentMode = process.env.DEPLOYMENT_MODE || 'cloud';
  }

  // Kubernetes-style liveness probe
  async liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  // Kubernetes-style readiness probe — checks all critical dependencies
  async readiness() {
    const checks = {};

    // 1. Database check
    try {
      const { prisma } = await import('../../../config/prisma.js');
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', type: 'postgresql' };
    } catch (e) {
      checks.database = { status: 'degraded', error: e.message };
    }

    // 2. Redis check
    try {
      const { gcpCacheService } = await import('./gcpCache.service.js');
      const pingResult = gcpCacheService.isInitialized;
      checks.redis = { status: pingResult ? 'ok' : 'degraded' };
    } catch (e) {
      checks.redis = { status: 'unavailable', error: e.message };
    }

    // 3. GCP Auth check
    try {
      const { GoogleAuth } = await import('google-auth-library');
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      await auth.getClient();
      checks.gcpAuth = { status: 'ok' };
    } catch (e) {
      checks.gcpAuth = { status: 'degraded', error: e.message };
    }

    // Aggregate
    const allOk = Object.values(checks).every((c) => c.status === 'ok');
    return {
      status: allOk ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      project: this.projectId,
      region: this.region,
      deploymentMode: this.deploymentMode,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
    };
  }

  // Deep health check — everything
  async deepHealth() {
    const readiness = await this.readiness();

    let gcpServices = {};
    try {
      const { getGcpServiceHealth } = await import('./gcpBootstrap.service.js');
      gcpServices = await getGcpServiceHealth();
    } catch (e) {
      gcpServices = { error: e.message };
    }

    return {
      ...readiness,
      gcpServices,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }
}

export const gcpHealthCheckService = new GcpHealthCheckService();
