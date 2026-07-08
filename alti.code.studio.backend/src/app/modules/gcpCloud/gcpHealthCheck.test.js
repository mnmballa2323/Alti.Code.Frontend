/**
 * GCP Health Check Service — Test Suite
 *
 * Validates the three Kubernetes-style probe endpoints:
 *   1. liveness()  — Always returns ok (process is alive)
 *   2. readiness() — Aggregated dependency health (db, redis, GCP auth)
 *   3. deepHealth() — Full system introspection with node/memory/cpu info
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { gcpHealthCheckService } from './gcpHealthCheck.service.js';

describe('GCP Health Check Service', () => {

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  // ── Liveness Probe ─────────────────────────────────────────────────────
  describe('Liveness', () => {
    it('should return ok status', async () => {
      const result = await gcpHealthCheckService.liveness();
      expect(result.status).toBe('ok');
    });

    it('should include a valid ISO timestamp', async () => {
      const result = await gcpHealthCheckService.liveness();
      expect(result.timestamp).toBeDefined();
      // Validate it's a parseable ISO date string
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should report non-negative uptime', async () => {
      const result = await gcpHealthCheckService.liveness();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Readiness Probe ────────────────────────────────────────────────────
  describe('Readiness', () => {
    it('should return a readiness status', async () => {
      const result = await gcpHealthCheckService.readiness();
      expect(result.status).toBeDefined();
      // In test mode without real DB/Redis, expect degraded or ready
      expect(['ready', 'degraded']).toContain(result.status);
    });

    it('should include dependency checks', async () => {
      const result = await gcpHealthCheckService.readiness();
      expect(result.checks).toBeDefined();
      expect(typeof result.checks).toBe('object');
    });

    it('should include deployment metadata', async () => {
      const result = await gcpHealthCheckService.readiness();
      expect(result.deploymentMode).toBeDefined();
      expect(result.project).toBeDefined();
      expect(result.region).toBeDefined();
    });

    it('should include uptime and timestamp', async () => {
      const result = await gcpHealthCheckService.readiness();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should check database health', async () => {
      const result = await gcpHealthCheckService.readiness();
      expect(result.checks.database).toBeDefined();
      expect(result.checks.database.status).toBeDefined();
    });

    it('should check Redis health', async () => {
      const result = await gcpHealthCheckService.readiness();
      expect(result.checks.redis).toBeDefined();
      expect(result.checks.redis.status).toBeDefined();
    });

    it('should check GCP auth health', async () => {
      const result = await gcpHealthCheckService.readiness();
      expect(result.checks.gcpAuth).toBeDefined();
      expect(result.checks.gcpAuth.status).toBeDefined();
    });
  });

  // ── Deep Health ────────────────────────────────────────────────────────
  describe('Deep Health', () => {
    it('should include Node.js version', async () => {
      const result = await gcpHealthCheckService.deepHealth();
      expect(result.nodeVersion).toBeDefined();
      expect(result.nodeVersion).toBe(process.version);
    });

    it('should include memory usage', async () => {
      const result = await gcpHealthCheckService.deepHealth();
      expect(result.memoryUsage).toBeDefined();
      expect(result.memoryUsage.heapUsed).toBeGreaterThan(0);
      expect(result.memoryUsage.rss).toBeGreaterThan(0);
    });

    it('should include CPU usage', async () => {
      const result = await gcpHealthCheckService.deepHealth();
      expect(result.cpuUsage).toBeDefined();
      expect(typeof result.cpuUsage.user).toBe('number');
      expect(typeof result.cpuUsage.system).toBe('number');
    });

    it('should include all readiness data', async () => {
      const result = await gcpHealthCheckService.deepHealth();
      // Deep health extends readiness, so it should have all readiness fields
      expect(result.status).toBeDefined();
      expect(result.checks).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should include GCP services health', async () => {
      const result = await gcpHealthCheckService.deepHealth();
      // gcpServices may be an error object if bootstrap hasn't run,
      // but the field should always be present
      expect(result.gcpServices).toBeDefined();
    });
  });
});
