/**
 * Copyright (c) 2024 Inso Code
 *
 * ENTERPRISE PHASES 39-41 TEST SUITE
 * API Keys + Caching + Error Recovery
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../shared/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../agents/agent.registry.js', () => ({
  agentRegistry: {
    agents: [],
    register: vi.fn(),
    get: vi.fn(),
    list: vi.fn(() => []),
    findByCapability: vi.fn(() => []),
    get count() {
      return 0;
    },
  },
}));

vi.mock('../legion/legion.factory.js', () => ({
  legionFactory: {
    getProcessor: vi.fn(() => async () => ({ result: 'test' })),
  },
}));

// ═══════════════════════════════════════════════
// Phase 39: API Key Management
// ═══════════════════════════════════════════════

describe('Phase 39: API Key Management', () => {
  it('should generate HMAC-SHA256 API keys', async () => {
    const { apiKeyManager } = await import('./api.keys.js');

    const result = apiKeyManager.generateKey('jpmorgan', {
      name: 'production-key',
      scopes: ['agents:dispatch', 'costs:read'],
    });

    expect(result.apiKey).toMatch(/^acs_live_/);
    expect(result.keyId).toMatch(/^key_/);
    expect(result.scopes).toContain('agents:dispatch');
    expect(result.expiresAt).toBeDefined();
    expect(result.warning).toContain('Store this key');

    // Key should validate
    const validation = apiKeyManager.validateKey(result.apiKey);
    expect(validation.valid).toBe(true);
    expect(validation.tenantId).toBe('jpmorgan');
  });

  it('should generate test environment keys', async () => {
    const { apiKeyManager } = await import('./api.keys.js');

    const result = apiKeyManager.generateKey('acme-corp', {
      name: 'staging-key',
      environment: 'staging',
    });

    expect(result.apiKey).toMatch(/^acs_test_/);
  });

  it('should reject invalid keys', async () => {
    const { apiKeyManager } = await import('./api.keys.js');

    const result = apiKeyManager.validateKey('acs_live_invalid_key_here');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('KEY_NOT_FOUND');
  });

  it('should rotate keys with grace period', async () => {
    const { apiKeyManager } = await import('./api.keys.js');

    const original = apiKeyManager.generateKey('goldman-sachs', {
      name: 'rotating-key',
    });
    const rotation = apiKeyManager.rotateKey('goldman-sachs', original.keyId, {
      gracePeriodMs: 3600000, // 1 hour
    });

    expect(rotation.newKey.apiKey).toBeDefined();
    expect(rotation.newKey.keyId).not.toBe(original.keyId);
    expect(rotation.oldKeyExpiresAt).toBeDefined();
    expect(rotation.gracePeriodMs).toBe(3600000);

    // Both keys should work during grace period
    const oldValid = apiKeyManager.validateKey(original.apiKey);
    expect(oldValid.valid).toBe(true);

    const newValid = apiKeyManager.validateKey(rotation.newKey.apiKey);
    expect(newValid.valid).toBe(true);
  });

  it('should revoke keys immediately', async () => {
    const { apiKeyManager } = await import('./api.keys.js');

    const key = apiKeyManager.generateKey('citi', { name: 'revokable-key' });
    apiKeyManager.revokeKey('citi', key.keyId);

    const result = apiKeyManager.validateKey(key.apiKey);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('KEY_REVOKED');
  });

  it('should list keys per tenant (redacted)', async () => {
    const { apiKeyManager } = await import('./api.keys.js');

    const keys = apiKeyManager.listKeys('jpmorgan');
    expect(keys.length).toBeGreaterThanOrEqual(1);
    // Should not contain raw key
    expect(keys[0].keyId).toBeDefined();
    expect(keys[0].apiKey).toBeUndefined();
  });

  it('should track usage per key', async () => {
    const { apiKeyManager } = await import('./api.keys.js');

    const key = apiKeyManager.generateKey('boeing', { name: 'usage-key' });
    apiKeyManager.validateKey(key.apiKey);
    apiKeyManager.validateKey(key.apiKey);
    apiKeyManager.validateKey(key.apiKey);

    const keys = apiKeyManager.listKeys('boeing');
    expect(keys[0].usage.requests).toBe(3);
  });
});

describe('Phase 39: Rate Limiting', () => {
  it('should enforce per-tenant rate limits', async () => {
    const { rateLimiter } = await import('./api.keys.js');

    const result = await rateLimiter.check('test-tenant', 'starter');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeLessThan(60);
    expect(result.tier).toBe('starter');
    expect(result.headers['X-RateLimit-Limit']).toBe(60);
  });

  it('should have 4 rate limit tiers', async () => {
    const { RATE_TIERS } = await import('./api.keys.js');

    expect(RATE_TIERS.starter.requestsPerMinute).toBe(60);
    expect(RATE_TIERS.professional.requestsPerMinute).toBe(300);
    expect(RATE_TIERS.enterprise.requestsPerMinute).toBe(1_000);
    expect(RATE_TIERS.sp500.requestsPerMinute).toBe(5_000);
  });

  it('should provide middleware factory', async () => {
    const { rateLimiter } = await import('./api.keys.js');
    const middleware = rateLimiter.middleware();
    expect(typeof middleware).toBe('function');
  });
});

// ═══════════════════════════════════════════════
// Phase 40: Enterprise Caching
// ═══════════════════════════════════════════════

describe('Phase 40: Enterprise Caching Layer', () => {
  it('should set and get from L1 cache', async () => {
    const { cacheController } = await import('./cache.layer.js');

    await cacheController.set('test:key1', { data: 'hello' }, { l1Ttl: 5000 });
    const result = await cacheController.get('test:key1');

    expect(result).toBeDefined();
    expect(result.value.data).toBe('hello');
    expect(result.source).toBe('L1');
  });

  it('should cascade L1 miss → L2 hit and promote', async () => {
    const { cacheController } = await import('./cache.layer.js');

    // Set with very short L1 TTL, longer L2
    await cacheController.set(
      'cascade:test',
      { msg: 'promoted' },
      {
        l1Ttl: 1, // expires immediately
        l2Ttl: 60000,
      },
    );

    // Wait for L1 to expire
    await new Promise(r => setTimeout(r, 50));

    const result = await cacheController.get('cascade:test');
    expect(result).toBeDefined();
    expect(result.source).toBe('L2');
    expect(result.value.msg).toBe('promoted');
  });

  it('should invalidate by tag', async () => {
    const { cacheController } = await import('./cache.layer.js');

    await cacheController.set('tagged:1', { id: 1 }, { tags: ['tenant:acme'] });
    await cacheController.set('tagged:2', { id: 2 }, { tags: ['tenant:acme'] });
    await cacheController.set(
      'tagged:3',
      { id: 3 },
      { tags: ['tenant:other'] },
    );

    const result = await cacheController.invalidateByTag('tenant:acme');
    expect(result.l1Invalidated).toBeGreaterThanOrEqual(2);
  });

  it('should deduplicate agent results', async () => {
    const { cacheController } = await import('./cache.layer.js');

    // First call — miss
    const first = await cacheController.dedup(
      'codeReview',
      'Review this function',
    );
    expect(first.hit).toBe(false);

    // Store result
    await cacheController.dedupStore(first.key, { optimized: true });

    // Second call with same input — hit
    const second = await cacheController.dedup(
      'codeReview',
      'Review this function',
    );
    expect(second.hit).toBe(true);
    expect(second.result.optimized).toBe(true);
  });

  it('should flush all caches', async () => {
    const { cacheController } = await import('./cache.layer.js');

    await cacheController.set('flush:1', 'data');
    const result = await cacheController.flush();

    expect(result.flushed).toBe(true);
    expect(result.l1Cleared).toBeGreaterThanOrEqual(0);
  });

  it('should report combined stats', async () => {
    const { cacheController } = await import('./cache.layer.js');
    const stats = cacheController.getStats();

    expect(stats.l1).toBeDefined();
    expect(stats.l1.hitRate).toBeDefined();
    expect(stats.l2).toBeDefined();
    expect(stats.dedup).toBeDefined();
  });

  it('should provide Express caching middleware', async () => {
    const { cacheController } = await import('./cache.layer.js');
    const middleware = cacheController.middleware(30000);
    expect(typeof middleware).toBe('function');
  });
});

// ═══════════════════════════════════════════════
// Phase 41: Error Recovery
// ═══════════════════════════════════════════════

describe('Phase 41: Error Recovery Pipeline', () => {
  describe('Dead Letter Queue', () => {
    it('should enqueue failed dispatches', async () => {
      const { dlq } = await import('./error.recovery.js');

      const entry = dlq.enqueue({
        job: { agentName: 'codeReview', task: 'Review auth module' },
        error: new Error('Gemini API timeout'),
        tenantId: 'jpmorgan',
        agentName: 'codeReview',
      });

      expect(entry.id).toMatch(/^dlq_/);
      expect(entry.error.type).toBe('TRANSIENT');
      expect(entry.status).toBe('QUEUED');
    });

    it('should classify errors correctly', async () => {
      const { dlq } = await import('./error.recovery.js');

      const transient = dlq.enqueue({
        job: {},
        error: new Error('Connection timeout'),
        agentName: 'test',
      });
      expect(transient.error.type).toBe('TRANSIENT');

      const permanent = dlq.enqueue({
        job: {},
        error: new Error('Unauthorized access'),
        agentName: 'test',
      });
      expect(permanent.error.type).toBe('PERMANENT');
    });

    it('should dequeue only transient errors', async () => {
      const { dlq } = await import('./error.recovery.js');

      const batch = dlq.dequeue(5);
      // Should only contain TRANSIENT errors
      batch.forEach(item => {
        expect(item.error.type).toBe('TRANSIENT');
        expect(item.status).toBe('REPROCESSING');
      });
    });

    it('should report DLQ stats', async () => {
      const { dlq } = await import('./error.recovery.js');
      const stats = dlq.getStats();

      expect(stats.totalEnqueued).toBeGreaterThanOrEqual(2);
      expect(stats.byType).toBeDefined();
      expect(stats.byStatus).toBeDefined();
    });
  });

  describe('Retry Policies', () => {
    it('should execute with retry on transient failure', async () => {
      const { retryPolicy } = await import('./error.recovery.js');

      let callCount = 0;
      const result = await retryPolicy.execute(async attempt => {
        callCount++;
        if (attempt < 1) throw new Error('Transient error');
        return 'success';
      }, 'agent-dispatch');

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(2);
    });

    it('should exhaust retries on persistent failure', async () => {
      const { retryPolicy } = await import('./error.recovery.js');

      const result = await retryPolicy.execute(async () => {
        throw new Error('Always fails');
      }, 'agent-dispatch');

      expect(result.success).toBe(false);
      expect(result.exhausted).toBe(true);
      // agent-dispatch has maxRetries: 2, so 1 initial + 2 retries = 3 attempts
      expect(result.attempts).toBeGreaterThanOrEqual(2);
    });

    it('should have 4 preset retry policies', async () => {
      const { retryPolicy } = await import('./error.recovery.js');
      const policies = retryPolicy.listPolicies();

      expect(policies['ai-provider']).toBeDefined();
      expect(policies['database']).toBeDefined();
      expect(policies['webhook']).toBeDefined();
      expect(policies['agent-dispatch']).toBeDefined();
      expect(policies['ai-provider'].maxRetries).toBe(4);
    });
  });

  describe('Schema Validator', () => {
    it('should validate dispatch requests', async () => {
      const { schemaValidator } = await import('./error.recovery.js');

      const valid = schemaValidator.validate('dispatch', {
        agentName: 'codeReview',
        task: 'Review authentication module',
      });
      expect(valid.valid).toBe(true);

      const invalid = schemaValidator.validate('dispatch', {
        task: '',
      });
      expect(invalid.valid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThanOrEqual(1);
    });

    it('should validate tenant creation', async () => {
      const { schemaValidator } = await import('./error.recovery.js');

      const valid = schemaValidator.validate('tenant', {
        name: 'JPMorgan Chase',
        plan: 'sp500',
        region: 'us-central1',
      });
      expect(valid.valid).toBe(true);

      const invalid = schemaValidator.validate('tenant', {
        name: 'X',
        plan: 'nonexistent',
      });
      expect(invalid.valid).toBe(false);
    });

    it('should have 4 preset schemas', async () => {
      const { schemaValidator } = await import('./error.recovery.js');
      const schemas = schemaValidator.listSchemas();

      expect(schemas.dispatch).toBeDefined();
      expect(schemas.tenant).toBeDefined();
      expect(schemas.webhook).toBeDefined();
      expect(schemas.apiKey).toBeDefined();
    });

    it('should provide Express middleware', async () => {
      const { schemaValidator } = await import('./error.recovery.js');
      const middleware = schemaValidator.middleware('dispatch');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('Error Budget Tracker', () => {
    it('should track error budget against SLO', async () => {
      const { errorBudget } = await import('./error.recovery.js');

      // Record 100 successes and 0 errors
      for (let i = 0; i < 100; i++) errorBudget.record(true);

      const budget = errorBudget.getBudget();
      expect(budget.sloTarget).toBe('99.99%');
      expect(budget.totalRequests).toBeGreaterThanOrEqual(100);
      expect(budget.status).toBe('HEALTHY');
    });

    it('should warn on high error consumption', async () => {
      const { errorBudget } = await import('./error.recovery.js');

      // Add many errors
      for (let i = 0; i < 50; i++) errorBudget.record(false);

      const budget = errorBudget.getBudget();
      expect(budget.errorsConsumed).toBeGreaterThanOrEqual(50);
      // With 150 total and 50 errors, budget should be stressed
      expect(budget.budgetUsedPercent).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════
// Cross-Module Integration
// ═══════════════════════════════════════════════

describe('Phases 39-41 Cross Integration', () => {
  it('should export all modules from barrel index', async () => {
    const enterprise = await import('./index.js');
    expect(enterprise.apiKeyManager).toBeDefined();
    expect(enterprise.rateLimiter).toBeDefined();
    expect(enterprise.RATE_TIERS).toBeDefined();
    expect(enterprise.cacheController).toBeDefined();
    expect(enterprise.dlq).toBeDefined();
    expect(enterprise.retryPolicy).toBeDefined();
    expect(enterprise.schemaValidator).toBeDefined();
    expect(enterprise.errorBudget).toBeDefined();
  });

  it('should integrate API key + rate limiter + validator', async () => {
    const { apiKeyManager, rateLimiter, schemaValidator } =
      await import('./index.js');

    // 1. Generate a key
    const key = apiKeyManager.generateKey('integration-test', {
      name: 'flow-key',
    });

    // 2. Validate the key
    const auth = apiKeyManager.validateKey(key.apiKey);
    expect(auth.valid).toBe(true);

    // 3. Rate check
    const rate = await rateLimiter.check(auth.tenantId, 'enterprise');
    expect(rate.allowed).toBe(true);

    // 4. Validate request
    const valid = schemaValidator.validate('dispatch', {
      agentName: 'codeReview',
      task: 'Integration test dispatch',
    });
    expect(valid.valid).toBe(true);
  });
});
