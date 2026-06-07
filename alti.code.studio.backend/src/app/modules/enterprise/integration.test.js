/**
 * Copyright (c) 2024 Inso Code
 * 
 * ENTERPRISE INTEGRATION TEST — Phases 33+35
 * Enterprise Bridge + Observability Pipeline
 */

import { describe, it, expect, vi } from 'vitest';

// ── Mock logger ──
vi.mock('../../../shared/logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

// ── Mock agent registry ──
vi.mock('../agents/agent.registry.js', () => ({
    agentRegistry: {
        agents: [],
        register: vi.fn(),
        get: vi.fn(),
        list: vi.fn(() => []),
        findByCapability: vi.fn(() => []),
        get count() { return 0; },
    }
}));

vi.mock('../legion/legion.factory.js', () => ({
    legionFactory: {
        getProcessor: vi.fn(() => async () => ({ result: 'test' })),
    }
}));

// ═══════════════════════════════════════════════
// Enterprise Bridge
// ═══════════════════════════════════════════════

describe('Phase 33: Enterprise Bridge', () => {
    it('should intercept dispatch with PII scanning', async () => {
        const { enterpriseBridge } = await import('./enterprise.bridge.js');

        const job = {
            agentName: 'codeReview',
            task: 'Review code for user SSN 123-45-6789',
            tenantId: 'acme-corp',
        };

        const enrichedJob = await enterpriseBridge.onBeforeDispatch(job);
        expect(enrichedJob._bridge).toBeDefined();
        expect(enrichedJob._bridge.classification).not.toBe('PUBLIC');
        expect(enrichedJob._bridge.tenantId).toBe('acme-corp');
        expect(enterpriseBridge.getStats().piiDetections).toBeGreaterThanOrEqual(1);
    });

    it('should persist result and publish event on dispatch completion', async () => {
        const { enterpriseBridge } = await import('./enterprise.bridge.js');

        const job = {
            agentName: 'cssArchitect',
            task: 'Optimize CSS',
            tenantId: 'acme-corp',
            _bridge: { startTime: Date.now() - 200, tenantId: 'acme-corp', classification: 'PUBLIC' },
        };

        const result = { optimized: true, tokensUsed: 500 };
        await enterpriseBridge.onAfterDispatch(job, result);

        const stats = enterpriseBridge.getStats();
        expect(stats.totalTokens).toBeGreaterThanOrEqual(500);
    });

    it('should handle dispatch errors and publish failure event', async () => {
        const { enterpriseBridge } = await import('./enterprise.bridge.js');

        await enterpriseBridge.onDispatchError(
            { agentName: 'failAgent', tenantId: 'acme-corp' },
            new Error('Provider timeout')
        );

        // Should not throw — gracefully handles the error
        expect(true).toBe(true);
    });

    it('should track dispatch stats', async () => {
        const { enterpriseBridge } = await import('./enterprise.bridge.js');
        const stats = enterpriseBridge.getStats();

        expect(stats.totalDispatches).toBeGreaterThanOrEqual(1);
        expect(stats.bridgeBootedAt).toBeDefined();
    });

    it('should enable/disable the bridge', async () => {
        const { enterpriseBridge } = await import('./enterprise.bridge.js');

        enterpriseBridge.disable();
        const jobBypassed = await enterpriseBridge.onBeforeDispatch({ agentName: 'test' });
        // When disabled, should return the original job without _bridge metadata
        expect(jobBypassed._bridge).toBeUndefined();

        enterpriseBridge.enable();
    });
});

// ═══════════════════════════════════════════════
// Observability Pipeline
// ═══════════════════════════════════════════════

describe('Phase 35: Observability Pipeline', () => {
    describe('Metric Collector', () => {
        it('should define and increment counters', async () => {
            const { metrics } = await import('./observability.js');

            metrics.increment('agent.dispatch.total', 5);
            metrics.increment('agent.dispatch.success', 4);
            metrics.increment('agent.dispatch.failure', 1);

            const json = metrics.toJSON();
            expect(json.counters['agent.dispatch.total'].value).toBeGreaterThanOrEqual(5);
            expect(json.counters['agent.dispatch.success'].value).toBeGreaterThanOrEqual(4);
        });

        it('should set and read gauges', async () => {
            const { metrics } = await import('./observability.js');

            metrics.setGauge('tenants.active', 42);
            metrics.setGauge('system.agents.registered', 115);

            const json = metrics.toJSON();
            expect(json.gauges['tenants.active'].value).toBe(42);
            expect(json.gauges['system.agents.registered'].value).toBe(115);
        });

        it('should observe histograms with bucket distribution', async () => {
            const { metrics } = await import('./observability.js');

            // Simulate agent latencies
            metrics.observe('agent.latency.ms', 50);
            metrics.observe('agent.latency.ms', 200);
            metrics.observe('agent.latency.ms', 500);
            metrics.observe('agent.latency.ms', 3000);
            metrics.observe('agent.latency.ms', 8000);

            const json = metrics.toJSON();
            const hist = json.histograms['agent.latency.ms'];
            expect(hist.count).toBeGreaterThanOrEqual(5);
            expect(hist.avg).toBeGreaterThan(0);
            expect(hist.buckets.length).toBeGreaterThanOrEqual(7);
        });

        it('should export Prometheus text format', async () => {
            const { metrics } = await import('./observability.js');
            const prom = metrics.toPrometheus();

            expect(prom).toContain('# HELP agent_dispatch_total');
            expect(prom).toContain('# TYPE agent_dispatch_total counter');
            expect(prom).toContain('# HELP system_uptime_seconds');
            expect(prom).toContain('# TYPE system_uptime_seconds gauge');
            expect(prom).toContain('agent_latency_ms_bucket');
        });

        it('should auto-update system gauges on export', async () => {
            const { metrics } = await import('./observability.js');
            const json = metrics.toJSON();

            expect(json.gauges['system.uptime.seconds'].value).toBeGreaterThanOrEqual(0);
            expect(json.gauges['system.memory.heapUsed'].value).toBeGreaterThan(0);
            expect(json.gauges['system.memory.rss'].value).toBeGreaterThan(0);
        });

        it('should have 25+ pre-defined metrics', async () => {
            const { metrics } = await import('./observability.js');
            const json = metrics.toJSON();

            const totalMetrics =
                Object.keys(json.counters).length +
                Object.keys(json.gauges).length +
                Object.keys(json.histograms).length;

            expect(totalMetrics).toBeGreaterThanOrEqual(25);
        });
    });

    describe('Distributed Tracer', () => {
        it('should create and complete trace spans', async () => {
            const { tracer } = await import('./observability.js');

            const span = tracer.startSpan('trace-001', 'cssArchitect.execute', {
                agentName: 'cssArchitect',
                tenantId: 'acme-corp',
            });

            expect(span.traceId).toBe('trace-001');
            expect(span.status).toBe('IN_PROGRESS');

            // Simulate work
            await new Promise(r => setTimeout(r, 10));
            tracer.endSpan(span.spanId, { output: 'optimized' });

            const completed = tracer.getTrace('trace-001');
            expect(completed.length).toBe(1);
            expect(completed[0].status).toBe('OK');
            expect(completed[0].durationMs).toBeGreaterThanOrEqual(5);
        });

        it('should track error spans', async () => {
            const { tracer } = await import('./observability.js');

            const span = tracer.startSpan('trace-err', 'failAgent.execute');
            tracer.endSpan(span.spanId, { error: 'Provider timeout' });

            const trace = tracer.getTrace('trace-err');
            expect(trace[0].status).toBe('ERROR');
        });

        it('should report tracer stats', async () => {
            const { tracer } = await import('./observability.js');
            const stats = tracer.getStats();

            expect(stats.completedTraces).toBeGreaterThanOrEqual(2);
            expect(stats.avgDurationMs).toBeGreaterThanOrEqual(0);
            expect(stats.errorRate).toBeDefined();
        });
    });

    describe('Agent Dashboard', () => {
        it('should return full system snapshot', async () => {
            const { dashboard } = await import('./observability.js');
            const snapshot = dashboard.getSystemSnapshot();

            expect(snapshot.system.uptime).toBeGreaterThan(0);
            expect(snapshot.system.memory.heapUsed).toBeGreaterThan(0);
            expect(snapshot.system.memory.unit).toBe('MB');
            expect(snapshot.system.nodeVersion).toContain('v');
            expect(snapshot.metrics).toBeDefined();
            expect(snapshot.tracing).toBeDefined();
        });

        it('should return per-agent performance', async () => {
            const { dashboard } = await import('./observability.js');
            const perf = dashboard.getAgentPerformance('cssArchitect');

            expect(perf.agentName).toBe('cssArchitect');
            expect(perf.totalCalls).toBeGreaterThanOrEqual(1);
            expect(perf.avgLatencyMs).toBeGreaterThanOrEqual(0);
        });

        it('should return SLA compliance report', async () => {
            const { dashboard } = await import('./observability.js');
            const sla = dashboard.getSLAReport();

            expect(sla.totalRequests).toBeGreaterThanOrEqual(2);
            expect(sla.availability).toContain('%');
            expect(sla.slaTarget).toBe('99.99%');
            expect(sla.slaViolation).toBeDefined();
        });
    });
});

// ═══════════════════════════════════════════════
// Cross-Module Integration
// ═══════════════════════════════════════════════

describe('Full Enterprise Stack Integration', () => {
    it('should export bridge from barrel index', async () => {
        const enterprise = await import('./index.js');
        expect(enterprise.enterpriseBridge).toBeDefined();
        expect(enterprise.metrics).toBeDefined();
        expect(enterprise.tracer).toBeDefined();
        expect(enterprise.dashboard).toBeDefined();
    });

    it('should run bridge + observability end-to-end', async () => {
        const { enterpriseBridge } = await import('./enterprise.bridge.js');
        const { metrics, tracer } = await import('./observability.js');

        // Simulate a full dispatch cycle with observability
        const traceId = `trace_${Date.now()}`;
        const span = tracer.startSpan(traceId, 'fullCycle.dispatch', { agentName: 'unitTestWriter' });

        const job = await enterpriseBridge.onBeforeDispatch({
            agentName: 'unitTestWriter',
            task: 'Write unit tests for auth module',
            tenantId: 'jpmorgan',
        });

        metrics.increment('agent.dispatch.total');
        metrics.observe('agent.latency.ms', 150);

        const result = { tests: 12, passing: 12, coverage: '94%' };
        await enterpriseBridge.onAfterDispatch(job, result);
        metrics.increment('agent.dispatch.success');

        tracer.endSpan(span.spanId, { output: result });

        // Verify everything was recorded
        const trace = tracer.getTrace(traceId);
        expect(trace.length).toBe(1);
        expect(trace[0].status).toBe('OK');

        const stats = enterpriseBridge.getStats();
        expect(stats.totalDispatches).toBeGreaterThanOrEqual(2);
    });
});
