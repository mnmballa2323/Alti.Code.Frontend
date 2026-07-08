/**
 * GCP Bootstrap Orchestrator — Test Suite
 *
 * Validates the bootstrap lifecycle:
 *   1. Exports correct orchestration functions
 *   2. Initializes all services without throwing in test mode
 *   3. Populates the service registry with 50+ entries
 *   4. Reports health status via gcpHealthCheck()
 *   5. Supports graceful shutdown
 *   6. Provides service lookup by name
 */
import { describe, it, expect, beforeAll } from 'vitest';

describe('GCP Bootstrap Orchestrator', () => {
  let bootstrapModule;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.GCP_REAL_SERVICES;
    bootstrapModule = await import('./gcpBootstrap.service.js');
  });

  // ── Export validation ──────────────────────────────────────────────────
  it('should export initializeGcpServices function', () => {
    expect(typeof bootstrapModule.initializeGcpServices).toBe('function');
  });

  it('should export shutdownGcpServices function', () => {
    expect(typeof bootstrapModule.shutdownGcpServices).toBe('function');
  });

  it('should export getServiceRegistry function', () => {
    expect(typeof bootstrapModule.getServiceRegistry).toBe('function');
  });

  it('should export getService function', () => {
    expect(typeof bootstrapModule.getService).toBe('function');
  });

  it('should export gcpHealthCheck function', () => {
    expect(typeof bootstrapModule.gcpHealthCheck).toBe('function');
  });

  // ── Initialization ─────────────────────────────────────────────────────
  describe('Service Initialization', () => {
    let registry;

    beforeAll(async () => {
      registry = await bootstrapModule.initializeGcpServices();
    });

    it('should bootstrap without throwing in test mode', () => {
      expect(registry).toBeDefined();
      expect(typeof registry).toBe('object');
    });

    it('should register at least 50 services', () => {
      const serviceNames = Object.keys(registry);
      expect(serviceNames.length).toBeGreaterThanOrEqual(50);
    });

    it('should register core infrastructure services', () => {
      const names = Object.keys(registry);
      const coreServices = ['storage', 'firestore', 'pubsub', 'cache', 'secretManager'];
      for (const name of coreServices) {
        expect(names).toContain(name);
      }
    });

    it('should have status for every registered service', () => {
      for (const [name, entry] of Object.entries(registry)) {
        expect(entry).toHaveProperty('status');
        expect(['ok', 'export-missing', 'load-failed']).toContain(entry.status);
      }
    });
  });

  // ── Service Lookup ─────────────────────────────────────────────────────
  describe('Service Lookup', () => {
    beforeAll(async () => {
      await bootstrapModule.initializeGcpServices();
    });

    it('should return a service instance for a known service', () => {
      const service = bootstrapModule.getService('healthCheck');
      // healthCheck is always loadable
      expect(service).not.toBeNull();
    });

    it('should return null for an unknown service', () => {
      const service = bootstrapModule.getService('nonExistentService12345');
      expect(service).toBeNull();
    });
  });

  // ── Health Check ───────────────────────────────────────────────────────
  describe('Health Reporting', () => {
    beforeAll(async () => {
      await bootstrapModule.initializeGcpServices();
    });

    it('should return a structured health report', async () => {
      const health = await bootstrapModule.gcpHealthCheck();
      expect(health).toBeDefined();
      expect(health.gcp).toBeDefined();
      expect(health.gcp.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.gcp.status);
    });

    it('should include project metadata in health report', async () => {
      const health = await bootstrapModule.gcpHealthCheck();
      expect(health.gcp.project).toBeDefined();
      expect(health.gcp.region).toBeDefined();
      expect(health.gcp.deploymentMode).toBeDefined();
    });

    it('should report service counts', async () => {
      const health = await bootstrapModule.gcpHealthCheck();
      expect(health.gcp.totalServices).toBeGreaterThanOrEqual(50);
      expect(typeof health.gcp.healthyServices).toBe('number');
    });
  });

  // ── Graceful Shutdown ──────────────────────────────────────────────────
  describe('Graceful Shutdown', () => {
    it('should handle shutdown gracefully without throwing', async () => {
      await bootstrapModule.initializeGcpServices();
      await expect(
        bootstrapModule.shutdownGcpServices()
      ).resolves.not.toThrow();
    });
  });
});
