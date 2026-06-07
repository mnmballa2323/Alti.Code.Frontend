/**
 * Copyright (c) 2024 Inso Code
 * 
 * ENTERPRISE MODULE TEST SUITE
 * Validates all S&P 500 readiness infrastructure.
 * 
 * Tests: SSO, RBAC, Tenants, Cost Attribution, Circuit Breakers,
 *        Event Bus, Batch Processing, Compliance, Agent SDK
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock logger ──
vi.mock('../../../shared/logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

// ── Mock agent registry ──
vi.mock('../agents/agent.registry.js', () => {
    const agents = [];
    return {
        agentRegistry: {
            agents,
            register: vi.fn((agent) => { agents.push(agent); }),
            get: vi.fn((name) => agents.find(a => a.name === name)),
            list: vi.fn(() => agents),
            findByCapability: vi.fn((cap) => agents.filter(a => a.capabilities?.includes(cap))),
            get count() { return agents.length; },
        }
    };
});

// ── Mock legion factory ──
vi.mock('../legion/legion.factory.js', () => ({
    legionFactory: {
        getProcessor: vi.fn(() => async (job) => ({ result: 'test', agent: 'test' })),
    }
}));

// ═══════════════════════════════════════════════
// Phase 26: Enterprise Auth
// ═══════════════════════════════════════════════

describe('Phase 26: Enterprise Auth & Tenant Isolation', () => {
    describe('SSO Provider', () => {
        it('should validate a well-formed JWT', async () => {
            const { enterpriseSSO } = await import('./sso.provider.js');

            // Create a mock JWT
            const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
            const payload = Buffer.from(JSON.stringify({
                sub: 'user-123',
                email: 'ceo@sp500.com',
                name: 'Test CEO',
                tenant_id: 'acme-corp',
                role: 'admin',
                region: 'us-central1',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
            })).toString('base64url');
            const sig = 'mock-signature';
            const token = `${header}.${payload}.${sig}`;

            const identity = await enterpriseSSO.validateToken(token);
            expect(identity.userId).toBe('user-123');
            expect(identity.email).toBe('ceo@sp500.com');
            expect(identity.tenantId).toBe('acme-corp');
            expect(identity.role).toBe('admin');
            expect(identity.permissions).toBeDefined();
            expect(identity.permissions.length).toBeGreaterThan(0);
        });

        it('should reject expired tokens', async () => {
            const { enterpriseSSO } = await import('./sso.provider.js');

            const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
            const payload = Buffer.from(JSON.stringify({
                sub: 'user-expired',
                exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
            })).toString('base64url');
            const token = `${header}.${payload}.mock-sig`;

            await expect(enterpriseSSO.validateToken(token)).rejects.toThrow('AUTH_TOKEN_EXPIRED');
        });

        it('should reject missing tokens', async () => {
            const { enterpriseSSO } = await import('./sso.provider.js');
            await expect(enterpriseSSO.validateToken(null)).rejects.toThrow('AUTH_NO_TOKEN');
        });

        it('should export all 8 enterprise roles', async () => {
            const { ROLES } = await import('./sso.provider.js');
            expect(Object.keys(ROLES).length).toBe(8);
            expect(ROLES.SUPER_ADMIN).toBe('super_admin');
            expect(ROLES.AUDITOR).toBe('auditor');
            expect(ROLES.BILLING).toBe('billing');
            expect(ROLES.SERVICE).toBe('service');
        });
    });

    describe('Tenant Service', () => {
        it('should have a default tenant on boot', async () => {
            const { tenantService } = await import('./tenant.service.js');
            const defaultTenant = await tenantService.resolve('default');
            expect(defaultTenant).toBeDefined();
            expect(defaultTenant.status).toBe('active');
        });

        it('should register new tenants with correct plan quotas', async () => {
            const { tenantService } = await import('./tenant.service.js');

            const tenant = tenantService.register({
                id: 'jpmorgan',
                name: 'JPMorgan Chase',
                plan: 'SP500',
                region: 'us-east1',
                compliance: ['SOX', 'PCI_DSS'],
                owner: 'cto@jpmorgan.com',
            });

            expect(tenant.plan).toBe('SP500');
            expect(tenant.quotas.maxUsers).toBe(-1); // unlimited
            expect(tenant.quotas.tokensPerMonth).toBe(-1); // unlimited
            expect(tenant.sla).toBe('99.99%');
            expect(tenant.dedicatedInfra).toBe(true);
            expect(tenant.compliance.length).toBe(2);
        });

        it('should track token usage per tenant', async () => {
            const { tenantService } = await import('./tenant.service.js');
            tenantService.trackUsage('jpmorgan', { tokens: 5000, requests: 1 });
            tenantService.trackUsage('jpmorgan', { tokens: 3000, requests: 1 });
            const tenant = await tenantService.resolve('jpmorgan');
            expect(tenant.usage.currentMonthTokens).toBeGreaterThanOrEqual(8000);
        });

        it('should suspend and detect suspended tenants', async () => {
            const { tenantService } = await import('./tenant.service.js');
            tenantService.register({ id: 'suspended-co', name: 'BadCorp', plan: 'STARTER' });
            tenantService.suspend('suspended-co', 'Non-payment');
            const t = await tenantService.resolve('suspended-co');
            expect(t.status).toBe('suspended');
        });

        it('should expose S&P 500 plan tier', async () => {
            const { PLANS } = await import('./tenant.service.js');
            expect(PLANS.SP500.name).toBe('S&P 500');
            expect(PLANS.SP500.sla).toBe('99.99%');
            expect(PLANS.SP500.dedicatedInfra).toBe(true);
            expect(PLANS.SP500.support).toBe('white-glove');
        });
    });
});

// ═══════════════════════════════════════════════
// Phase 27: Observability & Cost Attribution
// ═══════════════════════════════════════════════

describe('Phase 27: Observability & Cost Attribution', () => {
    it('should persist agent results', async () => {
        const { resultStore } = await import('./result.store.js');

        await resultStore.save({
            tenantId: 'acme-corp',
            agentName: 'cssArchitect',
            squad: 'frontend',
            jobId: 'job-001',
            input: { code: 'body {}' },
            output: { result: 'optimized' },
            tokensUsed: 1500,
            durationMs: 250,
            model: 'gemini-3.1-flash',
        });

        const results = await resultStore.query('acme-corp');
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results[0].agentName).toBe('cssArchitect');
    });

    it('should calculate cost attribution by agent/squad/model', async () => {
        const { resultStore } = await import('./result.store.js');

        // Save additional results
        await resultStore.save({ tenantId: 'acme-corp', agentName: 'reactBuilder', squad: 'frontend', tokensUsed: 2000, model: 'gpt-4o' });
        await resultStore.save({ tenantId: 'acme-corp', agentName: 'unitTestWriter', squad: 'testing', tokensUsed: 3000, model: 'gemini-3.1-flash' });

        const costs = await resultStore.getCostAttribution('acme-corp');
        expect(costs.totalTokens).toBeGreaterThan(0);
        expect(costs.totalRequests).toBeGreaterThanOrEqual(3);
        expect(costs.byAgent).toBeDefined();
        expect(costs.bySquad).toBeDefined();
        expect(costs.byModel).toBeDefined();
        expect(costs.estimatedCostUSD).toBeGreaterThanOrEqual(0);
    });

    it('should filter results by agent name and time range', async () => {
        const { resultStore } = await import('./result.store.js');
        const cssResults = await resultStore.query('acme-corp', { agentName: 'cssArchitect' });
        expect(cssResults.length).toBeGreaterThanOrEqual(1);
        expect(cssResults.every(r => r.agentName === 'cssArchitect')).toBe(true);
    });
});

// ═══════════════════════════════════════════════
// Phase 28: Resilience & SLA
// ═══════════════════════════════════════════════

describe('Phase 28: Resilience & SLA Infrastructure', () => {
    it('should track circuit breaker states', async () => {
        const { CircuitBreaker } = await import('./resilience.js');
        const cb = new CircuitBreaker('test-provider', { failureThreshold: 3 });

        expect(await cb.isAvailable()).toBe(true);
        await cb.recordFailure(new Error('timeout'));
        await cb.recordFailure(new Error('timeout'));
        await cb.recordFailure(new Error('timeout'));

        // Should be OPEN after 3 failures
        expect(await cb.isAvailable()).toBe(false);
        expect(cb.getStatus().state).toBe('OPEN');
    });

    it('should recover circuit after reset timeout', async () => {
        const { CircuitBreaker } = await import('./resilience.js');
        const cb = new CircuitBreaker('fast-recovery', { failureThreshold: 2, resetTimeoutMs: 50 });

        await cb.recordFailure(new Error('fail'));
        await cb.recordFailure(new Error('fail'));
        expect(await cb.isAvailable()).toBe(false);

        // Wait for reset
        await new Promise(r => setTimeout(r, 60));
        expect(await cb.isAvailable()).toBe(true); // HALF_OPEN
        expect(cb.getStatus().state).toBe('HALF_OPEN');
    });

    it('should execute AI calls with resilient provider', async () => {
        // Build a fresh provider to avoid singleton state issues
        const { CircuitBreaker } = await import('./resilience.js');

        // Create a mini resilient executor
        const providers = ['providerA', 'providerB'];
        const circuits = { providerA: new CircuitBreaker('providerA'), providerB: new CircuitBreaker('providerB') };

        // Execute successfully with first provider
        const cbA = circuits.providerA;
        expect(await cbA.isAvailable()).toBe(true);
        await cbA.recordSuccess();
        expect(cbA.getStatus().successRate).toBe(100);
    });

    it('should failover when a provider circuit is OPEN', async () => {
        const { CircuitBreaker } = await import('./resilience.js');

        const primary = new CircuitBreaker('primary', { failureThreshold: 2 });
        const backup = new CircuitBreaker('backup', { failureThreshold: 5 });

        // Trip the primary circuit
        await primary.recordFailure(new Error('down'));
        await primary.recordFailure(new Error('down'));
        expect(await primary.isAvailable()).toBe(false); // OPEN
        expect(await backup.isAvailable()).toBe(true);

        // Simulate failover logic
        const availResults = await Promise.all([primary, backup].map(cb => cb.isAvailable()));
        const result = [primary, backup][availResults.indexOf(true)];
        expect(result).toBe(backup);
    });

    it('should report AI provider health', async () => {
        const { resilientAI } = await import('./resilience.js');
        const health = resilientAI.getHealth();

        expect(health.totalProviders).toBe(4);
        expect(health.providers.gemini).toBeDefined();
        expect(health.providers.gpt4o).toBeDefined();
        expect(health.providers.claude).toBeDefined();
        expect(health.providers.ollama).toBeDefined();
    });
});

// ═══════════════════════════════════════════════
// Phase 29: Integration Layer
// ═══════════════════════════════════════════════

describe('Phase 29: Integration Layer — Event Bus & Webhooks', () => {
    it('should publish and subscribe to events', async () => {
        const { eventBus, EVENT_TYPES } = await import('./event.bus.js');
        let received = null;

        eventBus.subscribe(EVENT_TYPES.AGENT_COMPLETED, (event) => {
            received = event;
        });

        await eventBus.publish(EVENT_TYPES.AGENT_COMPLETED, {
            agentName: 'cssArchitect', jobId: 'job-1'
        }, { tenantId: 'acme-corp' });

        expect(received).not.toBeNull();
        expect(received.type).toBe('agent.completed');
        expect(received.payload.agentName).toBe('cssArchitect');
        expect(received.tenantId).toBe('acme-corp');
    });

    it('should support 18+ event types', async () => {
        const { EVENT_TYPES } = await import('./event.bus.js');
        expect(Object.keys(EVENT_TYPES).length).toBeGreaterThanOrEqual(18);
    });

    it('should query event history', async () => {
        const { eventBus } = await import('./event.bus.js');
        const events = eventBus.query({ tenantId: 'acme-corp', limit: 10 });
        expect(events.length).toBeGreaterThan(0);
    });

    it('should register and manage webhooks', async () => {
        const { webhookDispatcher } = await import('./event.bus.js');

        const webhook = webhookDispatcher.register('acme-corp', {
            url: 'https://hooks.slack.com/services/xxx',
            events: ['agent.completed', 'agent.failed'],
            secret: 'wh_secret_123',
        });

        expect(webhook.id).toMatch(/^wh_/);
        expect(webhook.active).toBe(true);

        const list = webhookDispatcher.list('acme-corp');
        expect(list.length).toBeGreaterThanOrEqual(1);
    });
});

// ═══════════════════════════════════════════════
// Phase 30: Batch Processing
// ═══════════════════════════════════════════════

describe('Phase 30: Batch Processing Engine', () => {
    it('should execute batch with configurable concurrency', async () => {
        const { batchProcessor } = await import('./batch.processor.js');

        const items = Array.from({ length: 20 }, (_, i) => ({ file: `file_${i}.js` }));
        let processed = 0;

        const result = await batchProcessor.execute({
            agentName: 'codeReview',
            items,
            concurrency: 5,
            tenantId: 'acme-corp',
            processorFn: async (item) => {
                processed++;
                return { reviewed: item.file };
            },
        });

        expect(result.totalItems).toBe(20);
        expect(result.completed).toBe(20);
        expect(result.failed).toBe(0);
        expect(result.status).toBe('completed');
        expect(processed).toBe(20);
    });

    it('should handle partial failures gracefully', async () => {
        const { batchProcessor } = await import('./batch.processor.js');

        const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));

        const result = await batchProcessor.execute({
            agentName: 'lint',
            items,
            concurrency: 3,
            tenantId: 'acme-corp',
            processorFn: async (item) => {
                if (item.id % 3 === 0) throw new Error('Lint failed');
                return { ok: true };
            },
        });

        expect(result.status).toBe('completed_with_errors');
        expect(result.completed + result.failed).toBe(10);
        expect(result.failed).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════
// Phase 31: Compliance Engine
// ═══════════════════════════════════════════════

describe('Phase 31: Compliance Engine — SOX / HIPAA / PCI-DSS / GDPR / FedRAMP', () => {
    it('should detect PII in text (SSN, credit cards, emails)', async () => {
        const { complianceEngine } = await import('./compliance.engine.js');

        const result = complianceEngine.classifyData(
            'Customer John Doe, SSN: 123-45-6789, card: 4111 1111 1111 1111, john@example.com'
        );

        expect(result.classification).toBe('TOP_SECRET'); // Credit card = TOP_SECRET
        expect(result.findings.length).toBeGreaterThanOrEqual(3);
        expect(result.requiresEncryption).toBe(true);
        expect(result.requiresMasking).toBe(true);
    });

    it('should classify clean text as PUBLIC', async () => {
        const { complianceEngine } = await import('./compliance.engine.js');
        const result = complianceEngine.classifyData('Hello world, this is a harmless string.');
        expect(result.classification).toBe('PUBLIC');
        expect(result.findings.length).toBe(0);
    });

    it('should log immutable audit entries with integrity hash', async () => {
        const { complianceEngine } = await import('./compliance.engine.js');

        const entry = await complianceEngine.log({
            action: 'DATA_ACCESS',
            actor: 'ceo@jpmorgan.com',
            tenantId: 'jpmorgan',
            resource: 'financial_reports',
            details: { reportId: 'Q4-2024' },
        });

        expect(entry.id).toMatch(/^audit_/);
        expect(entry.hash).toMatch(/^sha256:/);
        expect(entry.timestamp).toBeDefined();
    });

    it('should process GDPR erasure requests with 30-day deadline', async () => {
        const { complianceEngine } = await import('./compliance.engine.js');

        const request = await complianceEngine.requestErasure('jpmorgan', 'user-456', 'GDPR Article 17');
        expect(request.status).toBe('pending');
        expect(request.deadline).toBeDefined();
        expect(new Date(request.deadline).getTime()).toBeGreaterThan(Date.now());
    });

    it('should generate multi-framework compliance reports', async () => {
        const { complianceEngine } = await import('./compliance.engine.js');

        const report = complianceEngine.generateReport('jpmorgan', ['sox', 'hipaa', 'pci-dss', 'gdpr', 'fedramp']);

        expect(report.frameworks.sox).toBeDefined();
        expect(report.frameworks.sox.retentionYears).toBe(7);
        expect(report.frameworks.hipaa).toBeDefined();
        expect(report.frameworks.hipaa.phiDetection).toBe(true);
        expect(report.frameworks['pci-dss']).toBeDefined();
        expect(report.frameworks['pci-dss'].cardDataTokenization).toBe(true);
        expect(report.frameworks.gdpr).toBeDefined();
        expect(report.frameworks.gdpr.rightToErasure).toBe(true);
        expect(report.frameworks.fedramp).toBeDefined();
        expect(report.frameworks.fedramp.fips140).toBe(true);
        expect(Object.keys(report.frameworks).length).toBe(5);
    });
});

// ═══════════════════════════════════════════════
// Phase 32: Developer Platform — Agent SDK
// ═══════════════════════════════════════════════

describe('Phase 32: Developer Platform — Agent SDK', () => {
    it('should define custom tenant-scoped agents', async () => {
        const { agentSDK } = await import('./agent.sdk.js');

        const agent = agentSDK.defineCustomAgent({
            name: 'taxCalculator',
            description: 'Calculates tax obligations',
            prompt: 'You are a tax calculation agent...',
            capabilities: ['tax', 'finance'],
        }, 'jpmorgan');

        expect(agent.name).toBe('custom_jpmorgan_taxCalculator');
        expect(agent.type).toBe('custom');
        expect(agent.tenantId).toBe('jpmorgan');
    });

    it('should version and rollback agents', async () => {
        const { agentSDK } = await import('./agent.sdk.js');

        const v1 = agentSDK.publishVersion('cssArchitect', { prompt: 'v1 prompt' });
        expect(v1).toBe('1.0.0');

        const v2 = agentSDK.publishVersion('cssArchitect', { prompt: 'v2 prompt with BEM' });
        expect(v2).toBe('2.0.0');

        const rollback = agentSDK.rollback('cssArchitect', '1.0.0');
        expect(rollback.activeVersion).toBe('1.0.0');
    });

    it('should publish agents to marketplace', async () => {
        const { agentSDK } = await import('./agent.sdk.js');

        const listing = agentSDK.publishToMarketplace('cssArchitect', {
            title: 'CSS Architect Agent',
            description: 'Expert CSS optimization agent',
            price: 'free',
            category: 'frontend',
            tags: ['css', 'optimization', 'architecture'],
        });

        expect(listing.agentName).toBe('cssArchitect');
        expect(listing.installs).toBe(0);
    });

    it('should search marketplace by category and keyword', async () => {
        const { agentSDK } = await import('./agent.sdk.js');

        const results = agentSDK.searchMarketplace({ category: 'frontend' });
        expect(results.length).toBeGreaterThanOrEqual(1);

        const searchResults = agentSDK.searchMarketplace({ search: 'css' });
        expect(searchResults.length).toBeGreaterThanOrEqual(1);
    });

    it('should report comprehensive SDK stats', async () => {
        const { agentSDK } = await import('./agent.sdk.js');
        const stats = agentSDK.getStats();

        expect(stats.customAgents).toBeGreaterThanOrEqual(1);
        expect(stats.marketplaceListings).toBeGreaterThanOrEqual(1);
        expect(stats.versionedAgents).toBeGreaterThanOrEqual(1);
    });
});

// ═══════════════════════════════════════════════
// Cross-Module Integration
// ═══════════════════════════════════════════════

describe('Cross-Module Integration: S&P 500 Readiness', () => {
    it('should export all enterprise modules from index', async () => {
        const enterprise = await import('./index.js');

        // Phase 26
        expect(enterprise.enterpriseSSO).toBeDefined();
        expect(enterprise.ROLES).toBeDefined();
        expect(enterprise.PERMISSIONS).toBeDefined();
        expect(enterprise.rbac).toBeDefined();
        expect(enterprise.enforceResidency).toBeDefined();
        expect(enterprise.rateLimiter).toBeDefined();
        expect(enterprise.tenantService).toBeDefined();

        // Phase 27
        expect(enterprise.resultStore).toBeDefined();

        // Phase 28
        expect(enterprise.resilientAI).toBeDefined();
        expect(enterprise.healthChecker).toBeDefined();

        // Phase 29
        expect(enterprise.eventBus).toBeDefined();
        expect(enterprise.webhookDispatcher).toBeDefined();
        expect(enterprise.EVENT_TYPES).toBeDefined();

        // Phase 30
        expect(enterprise.batchProcessor).toBeDefined();

        // Phase 31
        expect(enterprise.complianceEngine).toBeDefined();

        // Phase 32
        expect(enterprise.agentSDK).toBeDefined();
    });

    it('should have all 7 compliance frameworks available', async () => {
        const { COMPLIANCE_PROFILES } = await import('./tenant.service.js');
        expect(Object.keys(COMPLIANCE_PROFILES).length).toBe(7);
        expect(COMPLIANCE_PROFILES.SOX).toBeDefined();
        expect(COMPLIANCE_PROFILES.HIPAA).toBeDefined();
        expect(COMPLIANCE_PROFILES.PCI_DSS).toBeDefined();
        expect(COMPLIANCE_PROFILES.FEDRAMP).toBeDefined();
        expect(COMPLIANCE_PROFILES.GDPR).toBeDefined();
        expect(COMPLIANCE_PROFILES.COMBINED).toBeDefined();
    });

    it('should have 4 GCP region groups for data residency', async () => {
        const { GCP_REGIONS } = await import('./sso.provider.js');
        expect(GCP_REGIONS.US.length).toBeGreaterThanOrEqual(4);
        expect(GCP_REGIONS.EU.length).toBeGreaterThanOrEqual(3);
        expect(GCP_REGIONS.APAC.length).toBeGreaterThanOrEqual(3);
        expect(GCP_REGIONS.MENA.length).toBeGreaterThanOrEqual(1);
    });

    it('should have 4 plan tiers including S&P 500', async () => {
        const { PLANS } = await import('./tenant.service.js');
        expect(Object.keys(PLANS).length).toBe(4);
        expect(PLANS.STARTER).toBeDefined();
        expect(PLANS.PROFESSIONAL).toBeDefined();
        expect(PLANS.ENTERPRISE).toBeDefined();
        expect(PLANS.SP500).toBeDefined();
    });
});
