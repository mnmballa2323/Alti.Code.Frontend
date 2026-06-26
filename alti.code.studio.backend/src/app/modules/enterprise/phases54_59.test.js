/**
 * Copyright (c) 2024 Inso Code
 *
 * ENTERPRISE PHASES 54-59 TEST SUITE
 * Health Probes + OpenAPI + Stress Tests + Cost Analytics + Benchmarks + Token Billing
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
// Phase 54: Health Check & Readiness Probes
// ═══════════════════════════════════════════════

describe('Phase 54: Health Check & Readiness Probes', () => {
  it('should return liveness status', async () => {
    const { healthCheck } = await import('./health.check.js');
    const result = healthCheck.healthz();
    expect(result.status).toBe('UP');
    expect(result.uptime).toBeDefined();
    expect(result.memory.used).toBeGreaterThan(0);
  });

  it('should return readiness status with dependency checks', async () => {
    const { healthCheck } = await import('./health.check.js');
    // Allow microTask to resolve (ready = true)
    await new Promise(r => setTimeout(r, 10));
    const result = healthCheck.readyz();
    expect(result.status).toBe('READY');
    expect(result.checks.length).toBeGreaterThanOrEqual(7);
  });

  it('should return deep liveness with degradation', async () => {
    const { healthCheck } = await import('./health.check.js');
    const result = healthCheck.livez();
    expect(result.status).toBe('HEALTHY');
    expect(result.degradedServices).toHaveLength(0);
  });

  it('should detect degraded dependencies', async () => {
    const { healthCheck } = await import('./health.check.js');
    healthCheck.setDependencyStatus('cache', 'DEGRADED', 150);
    const result = healthCheck.livez();
    expect(result.status).toBe('DEGRADED');
    expect(result.degradedServices).toContain('cache');
    healthCheck.setDependencyStatus('cache', 'HEALTHY', 0); // reset
  });

  it('should return startup probe', async () => {
    const { healthCheck } = await import('./health.check.js');
    const result = healthCheck.startupz();
    expect(result.started).toBe(true);
    expect(result.startedAt).toBeDefined();
  });

  it('should have 7 default dependencies', async () => {
    const { DEFAULT_DEPENDENCIES } = await import('./health.check.js');
    expect(Object.keys(DEFAULT_DEPENDENCIES).length).toBe(7);
  });

  it('should register custom checks', async () => {
    const { healthCheck } = await import('./health.check.js');
    healthCheck.registerCheck('custom_db', () => true);
    const result = healthCheck.livez();
    expect(result.customChecks.find(c => c.name === 'custom_db').status).toBe(
      'PASS',
    );
  });

  it('should track health history', async () => {
    const { healthCheck } = await import('./health.check.js');
    healthCheck.livez();
    const history = healthCheck.getHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  it('should report stats', async () => {
    const { healthCheck } = await import('./health.check.js');
    const stats = healthCheck.getStats();
    expect(stats.totalChecks).toBeGreaterThan(0);
    expect(stats.dependencies).toBe(7);
  });
});

// ═══════════════════════════════════════════════
// Phase 55: OpenAPI / Swagger Documentation
// ═══════════════════════════════════════════════

describe('Phase 55: OpenAPI / Swagger Documentation', () => {
  it('should register routes', async () => {
    const { openAPIGenerator } = await import('./openapi.generator.js');
    const result = openAPIGenerator.registerRoute({
      method: 'GET',
      path: '/test',
      summary: 'Test',
      tag: 'Test',
    });
    expect(result.registered).toBe(true);
  });

  it('should auto-register enterprise routes', async () => {
    const { openAPIGenerator } = await import('./openapi.generator.js');
    const result = openAPIGenerator.autoRegisterEnterprise();
    expect(result.registered).toBeGreaterThanOrEqual(26);
  });

  it('should generate OpenAPI 3.1 spec', async () => {
    const { openAPIGenerator } = await import('./openapi.generator.js');
    const spec = openAPIGenerator.generateSpec();
    expect(spec.openapi).toBe('3.1.0');
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
    expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
  });

  it('should have 13 tag categories', async () => {
    const { TAG_DEFINITIONS } = await import('./openapi.generator.js');
    expect(TAG_DEFINITIONS.length).toBe(13);
  });

  it('should support 2 security schemes', async () => {
    const { SECURITY_SCHEMES } = await import('./openapi.generator.js');
    expect(Object.keys(SECURITY_SCHEMES).length).toBe(2);
    expect(SECURITY_SCHEMES.bearerAuth.type).toBe('http');
    expect(SECURITY_SCHEMES.apiKey.type).toBe('apiKey');
  });

  it('should register schemas', async () => {
    const { openAPIGenerator } = await import('./openapi.generator.js');
    const result = openAPIGenerator.registerSchema('Agent', {
      type: 'object',
      properties: { name: { type: 'string' } },
    });
    expect(result.schemaId).toMatch(/^schema_/);
  });

  it('should report stats', async () => {
    const { openAPIGenerator } = await import('./openapi.generator.js');
    const stats = openAPIGenerator.getStats();
    expect(stats.totalRoutes).toBeGreaterThan(0);
    expect(stats.tags).toBe(13);
  });
});

// ═══════════════════════════════════════════════
// Phase 56: E2E Stress Test Engine
// ═══════════════════════════════════════════════

describe('Phase 56: E2E Stress Test Engine', () => {
  it('should register and run a stress suite', async () => {
    const { stressTestEngine } = await import('./stress.test.engine.js');
    stressTestEngine.registerSuite(
      'simple-test',
      i => {
        // lightweight operation
        JSON.parse(JSON.stringify({ i, data: 'test' }));
      },
      { iterations: 20, concurrency: 5, warmup: 2 },
    );

    const result = await stressTestEngine.runSuite('simple-test');
    expect(result.passed).toBe(true);
    expect(result.latency.p99).toBeDefined();
    expect(result.throughput).toBeGreaterThan(0);
    expect(result.errorRate).toBe(0);
  });

  it('should detect errors in stress tests', async () => {
    const { stressTestEngine } = await import('./stress.test.engine.js');
    let callCount = 0;
    stressTestEngine.registerSuite(
      'error-test',
      () => {
        callCount++;
        if (callCount % 2 === 0) throw new Error('fail');
      },
      {
        iterations: 10,
        concurrency: 2,
        warmup: 0,
        thresholds: { maxErrorRate: 0.3 },
      },
    );

    const result = await stressTestEngine.runSuite('error-test');
    expect(result.errors).toBeGreaterThan(0);
  });

  it('should have benchmark thresholds', async () => {
    const { BENCHMARK_THRESHOLDS } = await import('./stress.test.engine.js');
    expect(BENCHMARK_THRESHOLDS.maxP99Latency).toBe(200);
    expect(BENCHMARK_THRESHOLDS.minThroughput).toBe(100);
  });

  it('should report stats', async () => {
    const { stressTestEngine } = await import('./stress.test.engine.js');
    const stats = stressTestEngine.getStats();
    expect(stats.totalRuns).toBeGreaterThan(0);
    expect(stats.passRate).toBeDefined();
  });
});

// ═══════════════════════════════════════════════
// Phase 57: Cost Analytics Dashboard
// ═══════════════════════════════════════════════

describe('Phase 57: Cost Analytics Dashboard', () => {
  it('should record cost events', async () => {
    const { costAnalytics } = await import('./cost.analytics.js');
    const result = costAnalytics.recordCost({
      tenantId: 'jpmorgan',
      agentName: 'code-reviewer',
      category: 'tokens',
      quantity: 5000,
    });
    expect(result.id).toMatch(/^cost_/);
    expect(result.cost).toBeGreaterThan(0);
  });

  it('should set and check budget', async () => {
    const { costAnalytics } = await import('./cost.analytics.js');
    costAnalytics.setBudget('jpmorgan', { monthly: 500 });
    const status = costAnalytics.getBudgetStatus('jpmorgan');
    expect(status.hasBudget).toBe(true);
    expect(status.status).toBeDefined();
  });

  it('should break down costs by tenant', async () => {
    const { costAnalytics } = await import('./cost.analytics.js');
    const breakdown = costAnalytics.getByTenant('jpmorgan');
    expect(breakdown.totalCost).toBeGreaterThan(0);
    expect(breakdown.byCategory.tokens).toBeGreaterThan(0);
  });

  it('should break down costs by agent', async () => {
    const { costAnalytics } = await import('./cost.analytics.js');
    const breakdown = costAnalytics.getByAgent('code-reviewer');
    expect(breakdown.totalCost).toBeGreaterThan(0);
    expect(breakdown.dispatches).toBeGreaterThan(0);
  });

  it('should calculate ROI', async () => {
    const { costAnalytics } = await import('./cost.analytics.js');
    const roi = costAnalytics.calculateROI('code-reviewer', 1000);
    expect(roi.roi).toBeDefined();
    expect(roi.profit).toBeGreaterThan(0);
  });

  it('should compute trends', async () => {
    const { costAnalytics } = await import('./cost.analytics.js');
    const trends = costAnalytics.getTrends('jpmorgan', 'daily');
    expect(trends.trends.length).toBeGreaterThan(0);
  });

  it('should have 5 cost categories', async () => {
    const { COST_CATEGORIES } = await import('./cost.analytics.js');
    expect(Object.keys(COST_CATEGORIES).length).toBe(5);
  });

  it('should report stats', async () => {
    const { costAnalytics } = await import('./cost.analytics.js');
    const stats = costAnalytics.getStats();
    expect(stats.totalRecords).toBeGreaterThan(0);
    expect(stats.categories).toBe(5);
  });
});

// ═══════════════════════════════════════════════
// Phase 58: Agent Performance Benchmarking
// ═══════════════════════════════════════════════

describe('Phase 58: Agent Performance Benchmarking', () => {
  it('should record performance metrics', async () => {
    const { perfBenchmark } = await import('./perf.benchmark.js');
    // Record several data points
    for (let i = 0; i < 20; i++) {
      perfBenchmark.record('scanner-agent', {
        latency: 50 + Math.random() * 100,
        tokensUsed: 1000 + Math.floor(Math.random() * 500),
        tokensOptimal: 900,
        success: Math.random() > 0.05,
      });
    }
    const result = perfBenchmark.record('scanner-agent', {
      latency: 75,
      tokensUsed: 1200,
      tokensOptimal: 1000,
    });
    expect(result.recorded).toBe(true);
  });

  it('should compute latency percentiles', async () => {
    const { perfBenchmark } = await import('./perf.benchmark.js');
    const percentiles = perfBenchmark.getLatencyPercentiles('scanner-agent');
    expect(percentiles.p50).toBeGreaterThan(0);
    expect(percentiles.p95).toBeGreaterThanOrEqual(percentiles.p50);
    expect(percentiles.p99).toBeGreaterThanOrEqual(percentiles.p95);
  });

  it('should grade token efficiency', async () => {
    const { perfBenchmark } = await import('./perf.benchmark.js');
    const efficiency = perfBenchmark.getTokenEfficiency('scanner-agent');
    expect(efficiency.grade).toMatch(/[A-F]/);
    expect(efficiency.efficiency).toBeDefined();
  });

  it('should set and check SLA compliance', async () => {
    const { perfBenchmark } = await import('./perf.benchmark.js');
    perfBenchmark.setSLA('scanner-agent', 'standard');
    const sla = perfBenchmark.getSLACompliance('scanner-agent');
    expect(sla.tier).toBe('standard');
    expect(sla.target).toBe('99.9%');
    expect(typeof sla.compliant).toBe('boolean');
  });

  it('should have 3 SLA tiers', async () => {
    const { SLA_TIERS } = await import('./perf.benchmark.js');
    expect(Object.keys(SLA_TIERS).length).toBe(3);
  });

  it('should have 5 efficiency grades', async () => {
    const { EFFICIENCY_GRADES } = await import('./perf.benchmark.js');
    expect(Object.keys(EFFICIENCY_GRADES).length).toBe(5);
  });

  it('should compare agents', async () => {
    const { perfBenchmark } = await import('./perf.benchmark.js');
    perfBenchmark.record('fast-agent', {
      latency: 10,
      tokensUsed: 500,
      tokensOptimal: 500,
      success: true,
    });
    const comparison = perfBenchmark.compareAgents([
      'scanner-agent',
      'fast-agent',
    ]);
    expect(comparison.compared).toBe(2);
    expect(comparison.ranking[0].rank).toBe(1);
  });

  it('should track error rates', async () => {
    const { perfBenchmark } = await import('./perf.benchmark.js');
    const errorRate = perfBenchmark.getErrorRate('scanner-agent');
    expect(errorRate.total).toBeGreaterThan(0);
    expect(errorRate.errorRate).toBeDefined();
  });

  it('should report stats', async () => {
    const { perfBenchmark } = await import('./perf.benchmark.js');
    const stats = perfBenchmark.getStats();
    expect(stats.totalAgents).toBeGreaterThan(0);
    expect(stats.slaTiers).toBe(3);
  });
});

// ═══════════════════════════════════════════════
// Phase 59: Token Metering & Billing Engine
// ═══════════════════════════════════════════════

describe('Phase 59: Token Metering & Billing Engine', () => {
  it('should create billing account with plan', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const account = tokenBilling.createAccount('jpmorgan', 'enterprise');
    expect(account.id).toMatch(/^billing_/);
    expect(account.plan).toBe('enterprise');
    expect(account.monthlyAllowance).toBe(50_000_000);
  });

  it('should consume tokens with model-specific rates', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const result = tokenBilling.consumeTokens('jpmorgan', {
      agentName: 'code-reviewer',
      model: 'gpt-4o',
      inputTokens: 2000,
      outputTokens: 500,
    });
    expect(result.consumed).toBe(true);
    expect(result.totalTokens).toBe(2500);
    expect(result.cost).toBeGreaterThan(0);
    expect(result.tokensRemaining).toBeLessThan(50_000_000);
  });

  it('should block free-tier overage', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    tokenBilling.createAccount('free_tenant', 'free');
    // Consume all allowed tokens (exactly at limit)
    tokenBilling.consumeTokens('free_tenant', {
      agentName: 'test',
      inputTokens: 49_000,
      outputTokens: 0,
    });
    // Should be blocked (would exceed limit)
    const result = tokenBilling.consumeTokens('free_tenant', {
      agentName: 'test',
      inputTokens: 5000,
      outputTokens: 0,
    });
    expect(result.consumed).toBe(false);
    expect(result.reason).toContain('exceeded');
  });

  it('should estimate cost before dispatch', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const estimate = tokenBilling.estimateCost(
      'jpmorgan',
      5000,
      1000,
      'claude-3.5-sonnet',
    );
    expect(estimate.estimatedCost).toBeGreaterThan(0);
    expect(estimate.inputCost).toBeGreaterThan(0);
    expect(estimate.outputCost).toBeGreaterThan(0);
  });

  it('should have 5 pricing plans', async () => {
    const { TOKEN_PRICING_PLANS } = await import('./token.billing.js');
    expect(Object.keys(TOKEN_PRICING_PLANS).length).toBe(5);
    expect(TOKEN_PRICING_PLANS.free.monthlyTokens).toBe(50_000);
    expect(TOKEN_PRICING_PLANS.unlimited.monthlyTokens).toBe(Infinity);
  });

  it('should have 7 model rates', async () => {
    const { MODEL_RATES } = await import('./token.billing.js');
    expect(Object.keys(MODEL_RATES).length).toBe(7);
    expect(MODEL_RATES['gpt-4o']).toBeDefined();
    expect(MODEL_RATES['claude-3.5-sonnet']).toBeDefined();
  });

  it('should generate usage report', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const report = tokenBilling.getUsageReport('jpmorgan');
    expect(report.totalTokens).toBeGreaterThan(0);
    expect(report.byAgent.length).toBeGreaterThan(0);
    expect(report.byModel.length).toBeGreaterThan(0);
  });

  it('should generate invoice with tax', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const invoice = tokenBilling.generateInvoice('jpmorgan');
    expect(invoice.id).toMatch(/^inv_/);
    expect(invoice.total).toBeGreaterThan(0);
    expect(invoice.tax).toBeGreaterThan(0);
    expect(invoice.lineItems.length).toBeGreaterThanOrEqual(2);
  });

  it('should add prepaid tokens', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const result = tokenBilling.addPrepaidTokens('jpmorgan', 100, 1_000_000);
    expect(result.tokensAdded).toBe(1_000_000);
    expect(result.totalPrepaid).toBe(1_000_000);
  });

  it('should list all plans and models', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const plans = tokenBilling.listPlans();
    expect(Object.keys(plans).length).toBe(5);
    const models = tokenBilling.listModels();
    expect(Object.keys(models).length).toBe(7);
  });

  it('should report stats', async () => {
    const { tokenBilling } = await import('./token.billing.js');
    const stats = tokenBilling.getStats();
    expect(stats.totalAccounts).toBeGreaterThan(0);
    expect(stats.totalTokensConsumed).toBeGreaterThan(0);
    expect(stats.plans).toBe(5);
    expect(stats.models).toBe(7);
  });
});

// ═══════════════════════════════════════════════
// Cross Integration
// ═══════════════════════════════════════════════

describe('Phases 54-59 Cross Integration', () => {
  it('should export all modules from barrel index', async () => {
    const enterprise = await import('./index.js');
    // Phase 54
    expect(enterprise.healthCheck).toBeDefined();
    expect(enterprise.HEALTH_STATUSES).toBeDefined();
    // Phase 55
    expect(enterprise.openAPIGenerator).toBeDefined();
    expect(enterprise.TAG_DEFINITIONS).toBeDefined();
    // Phase 56
    expect(enterprise.stressTestEngine).toBeDefined();
    // Phase 57
    expect(enterprise.costAnalytics).toBeDefined();
    expect(enterprise.COST_CATEGORIES).toBeDefined();
    // Phase 58
    expect(enterprise.perfBenchmark).toBeDefined();
    expect(enterprise.SLA_TIERS).toBeDefined();
    // Phase 59
    expect(enterprise.tokenBilling).toBeDefined();
    expect(enterprise.TOKEN_PRICING_PLANS).toBeDefined();
    expect(enterprise.MODEL_RATES).toBeDefined();
  });

  it('should consume tokens and track cost in cost analytics', async () => {
    const { tokenBilling, costAnalytics } = await import('./index.js');
    const tenantId = 'integration_test';
    tokenBilling.createAccount(tenantId, 'professional');
    const consumption = tokenBilling.consumeTokens(tenantId, {
      agentName: 'int-agent',
      model: 'gpt-4o-mini',
      inputTokens: 3000,
      outputTokens: 1000,
    });
    // Also record to cost analytics
    costAnalytics.recordCost({
      tenantId,
      agentName: 'int-agent',
      category: 'tokens',
      quantity: 4000,
    });
    expect(consumption.consumed).toBe(true);
    const report = costAnalytics.getByTenant(tenantId);
    expect(report.totalCost).toBeGreaterThan(0);
  });

  it('should benchmark agent and check health', async () => {
    const { perfBenchmark, healthCheck } = await import('./index.js');
    perfBenchmark.record('health-check-agent', {
      latency: 50,
      tokensUsed: 500,
      tokensOptimal: 450,
      success: true,
    });
    const health = healthCheck.healthz();
    expect(health.status).toBe('UP');
    const efficiency = perfBenchmark.getTokenEfficiency('health-check-agent');
    expect(efficiency.grade).toBeDefined();
  });
});
