/**
 * GCP Cloud Services — Comprehensive Meta-Test Suite
 *
 * Dynamically discovers and tests ALL gcp*.service.js files in this directory.
 * Validates that every service:
 *   1. Exports at least one named export
 *   2. Exports a service singleton instance (not a raw class)
 *   3. Skips real SDK initialization in test mode (isInitialized === false)
 *   4. Returns graceful fallback values from all public API methods
 *
 * Excluded files: bootstrap, healthCheck, startupValidator, observability
 * (these have dedicated test files or fundamentally different patterns).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Auto-discover all gcp*.service.js files ──
// Exclude infrastructure / orchestrator files that have their own test suites
const EXCLUDED_FILES = [
  'gcpBootstrap.service.js',
  'gcpHealthCheck.service.js',
  'gcpStartupValidator.service.js',
  'gcpObservability.service.js',
];

const serviceFiles = readdirSync(__dirname)
  .filter(f => f.startsWith('gcp') && f.endsWith('.service.js'))
  .filter(f => !EXCLUDED_FILES.includes(f));

// ═══════════════════════════════════════════════════════════════════════════
//  Main Test Suite
// ═══════════════════════════════════════════════════════════════════════════
describe('GCP Cloud Services — Initialization & Graceful Fallback', () => {

  // Ensure NODE_ENV=test is set so services skip real SDK init
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.GCP_REAL_SERVICES;
  });

  // ── Service Discovery ──────────────────────────────────────────────────
  describe('Service Discovery', () => {
    it('should discover at least 60 GCP service files', () => {
      expect(serviceFiles.length).toBeGreaterThanOrEqual(60);
    });

    it('should not include excluded infrastructure files', () => {
      for (const excluded of EXCLUDED_FILES) {
        expect(serviceFiles).not.toContain(excluded);
      }
    });

    it('should only contain .service.js files', () => {
      for (const file of serviceFiles) {
        expect(file).toMatch(/^gcp.*\.service\.js$/);
      }
    });
  });

  // ── Per-Service Dynamic Tests ──────────────────────────────────────────
  for (const file of serviceFiles) {
    describe(file, () => {
      let mod;

      beforeAll(async () => {
        mod = await import(`./${file}`);
      });

      // 1. Export validation
      it('should export at least one named export', () => {
        const exports = Object.keys(mod);
        expect(exports.length).toBeGreaterThanOrEqual(1);
      });

      // 2. Service instance (not a raw class / constructor)
      it('should export a service instance (not a raw class)', () => {
        const exports = Object.keys(mod);
        // Find the main service export — name contains "service" (case-insensitive)
        // or "Service" to catch both gcpFooService and FooService patterns
        const serviceExport = exports.find(e =>
          e.toLowerCase().includes('service')
        );
        expect(serviceExport).toBeDefined();

        const value = mod[serviceExport];
        // Should be an object (instance) or a frozen plain-object singleton
        expect(typeof value).toBe('object');
        // Should NOT be null
        expect(value).not.toBeNull();
      });

      // 3. Test-mode initialization guard
      it('should have isInitialized === false in test mode (if applicable)', () => {
        const exports = Object.keys(mod);
        const serviceExport = exports.find(e =>
          e.toLowerCase().includes('service')
        );
        if (!serviceExport || !mod[serviceExport]) return;

        const instance = mod[serviceExport];

        // Only check if the service uses the class-based pattern with isInitialized
        if ('isInitialized' in instance) {
          expect(instance.isInitialized).toBe(false);
        }
      });

      // 4. Graceful fallback — all public methods callable without throwing
      it('should have API methods that return graceful fallbacks', async () => {
        const exports = Object.keys(mod);
        const serviceExport = exports.find(e =>
          e.toLowerCase().includes('service')
        );
        if (!serviceExport || !mod[serviceExport]) return;

        const instance = mod[serviceExport];

        // Collect public methods from prototype chain (class-based)
        // or own properties (plain-object singletons)
        let methods = [];

        const proto = Object.getPrototypeOf(instance);
        if (proto && proto !== Object.prototype) {
          // Class-based service
          methods = Object.getOwnPropertyNames(proto)
            .filter(m => m !== 'constructor' && !m.startsWith('_'));
        } else {
          // Plain-object service (like A2aService, GcpLoggingServiceInstance)
          methods = Object.keys(instance)
            .filter(m => !m.startsWith('_'));
        }

        // Each public method should be callable without throwing GCP SDK errors
        for (const method of methods) {
          if (typeof instance[method] !== 'function') continue;

          try {
            const result = await instance[method]();
            // Result should be defined — null, [], {}, false, 0 are all valid
            // but undefined indicates a broken / unimplemented method
            expect(result).not.toBeUndefined();
          } catch (e) {
            // Methods that require specific arguments may throw TypeError — OK
            // Methods may throw ApiError for missing args — OK
            // But they should NEVER throw unhandled GCP SDK errors
            expect(e.constructor.name).not.toBe('GoogleError');
            expect(e.message).not.toMatch(/Could not load the default credentials/);
          }
        }
      });
    });
  }
});
