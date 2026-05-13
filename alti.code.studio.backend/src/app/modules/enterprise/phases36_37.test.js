/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * ENTERPRISE PHASES 36-37 TEST SUITE
 * Multi-Region Failover + Admin Dashboard
 */

import { describe, it, expect, vi } from 'vitest';

// ── Mock logger ──
vi.mock('../../../shared/logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

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
// Phase 36: Multi-Region Failover
// ═══════════════════════════════════════════════

describe('Phase 36: Multi-Region Failover', () => {
    it('should bootstrap with us-central1 as primary', async () => {
        const { multiRegion } = await import('./multi.region.js');
        const clusters = multiRegion.getClustersStatus();

        expect(clusters.length).toBeGreaterThanOrEqual(1);
        const primary = clusters.find(c => c.isPrimary);
        expect(primary).toBeDefined();
        expect(primary.region).toBe('us-central1');
        expect(primary.status).toBe('HEALTHY');
    });

    it('should register additional clusters', async () => {
        const { multiRegion } = await import('./multi.region.js');

        multiRegion.registerCluster('europe-west1', { isPrimary: false });
        multiRegion.registerCluster('asia-east1', { isPrimary: false });

        const stats = multiRegion.getStats();
        expect(stats.totalClusters).toBeGreaterThanOrEqual(3);
    });

    it('should health check all clusters', async () => {
        const { multiRegion } = await import('./multi.region.js');
        const health = await multiRegion.checkAllHealth();

        expect(Object.keys(health).length).toBeGreaterThanOrEqual(3);
        for (const region of Object.keys(health)) {
            expect(health[region].status).toBeDefined();
            expect(health[region].latencyMs).toBeGreaterThanOrEqual(0);
        }
    });

    it('should failover from primary to secondary', async () => {
        const { multiRegion } = await import('./multi.region.js');

        const result = await multiRegion.triggerFailover('us-central1', 'automated-test');
        expect(result.from).toBe('us-central1');
        expect(result.to).toBeDefined();
        expect(result.status).toContain('SUCCESS');
        expect(result.rtoMs).toBeGreaterThanOrEqual(0);
    });

    it('should route traffic to correct region based on zone', async () => {
        const { multiRegion } = await import('./multi.region.js');

        // Reset primary after failover
        const clusters = multiRegion.getClustersStatus();
        const currentPrimary = clusters.find(c => c.isPrimary);

        const route = multiRegion.routeRequest(currentPrimary.zone);
        expect(route.region).toBeDefined();
        expect(route.endpoint).toContain('https://');
    });

    it('should set traffic weights', async () => {
        const { multiRegion } = await import('./multi.region.js');

        // Get current clusters and build weights
        const allClusters = multiRegion.getClustersStatus();
        const weights = {};
        const perCluster = Math.floor(100 / allClusters.length);
        let remaining = 100;
        allClusters.forEach((c, i) => {
            if (i === allClusters.length - 1) {
                weights[c.region] = remaining;
            } else {
                weights[c.region] = perCluster;
                remaining -= perCluster;
            }
        });

        const result = await multiRegion.setTrafficWeights(weights);
        expect(Object.values(result).reduce((s, v) => s + v, 0)).toBe(100);
    });

    it('should report disaster recovery status', async () => {
        const { multiRegion } = await import('./multi.region.js');
        const dr = multiRegion.getDisasterRecoveryStatus();

        expect(dr.rtoTarget).toContain('s');
        expect(dr.rpoTarget).toContain('s');
        expect(dr.totalFailovers).toBeGreaterThanOrEqual(1);
        expect(dr.clusters).toBeDefined();
    });

    it('should record backup and track RPO', async () => {
        const { multiRegion } = await import('./multi.region.js');

        const backup = multiRegion.recordBackup();
        expect(backup.backed_up_at).toBeDefined();

        const dr = multiRegion.getDisasterRecoveryStatus();
        expect(dr.lastBackup).toBeDefined();
        expect(dr.rpoMet).toBe(true); // Just backed up, so RPO should be met
    });
});

// ═══════════════════════════════════════════════
// Phase 37: Admin Dashboard
// ═══════════════════════════════════════════════

describe('Phase 37: Enterprise Admin Dashboard', () => {
    it('should return full system overview', async () => {
        const { adminDashboard } = await import('./admin.dashboard.js');
        const overview = adminDashboard.getSystemOverview();

        expect(overview.platform.name).toBe('Alti.Code.Studio');
        expect(overview.platform.version).toContain('enterprise');
        expect(overview.platform.uptime).toBeGreaterThan(0);
        expect(overview.platform.uptimeFormatted).toBeDefined();
        expect(overview.infrastructure).toBeDefined();
        expect(overview.agents).toBeDefined();
        expect(overview.tenants).toBeDefined();
        expect(overview.operations).toBeDefined();
        expect(overview.compliance).toBeDefined();
    });

    it('should return agent fleet overview', async () => {
        const { adminDashboard } = await import('./admin.dashboard.js');
        const fleet = adminDashboard.getAgentFleet();

        expect(fleet.categories).toBeDefined();
        expect(fleet.categories.code.count).toBeGreaterThanOrEqual(25);
        expect(fleet.categories.security.count).toBeGreaterThanOrEqual(15);
        expect(fleet.categories.enterprise.count).toBeGreaterThanOrEqual(25);
    });

    it('should generate executive summary', async () => {
        const { adminDashboard } = await import('./admin.dashboard.js');
        const summary = adminDashboard.generateExecutiveSummary();

        expect(summary.title).toContain('Executive Summary');
        expect(summary.keyMetrics).toBeDefined();
        expect(summary.keyMetrics.slaTarget).toBe('99.99%');
        expect(summary.security.complianceFrameworks).toContain('SOX');
        expect(summary.security.complianceFrameworks).toContain('HIPAA');
        expect(summary.security.encryptionStandard).toContain('AES-256');
        expect(summary.recommendations).toBeDefined();
        expect(summary.recommendations.length).toBeGreaterThanOrEqual(1);
    });

    it('should provide capacity projections', async () => {
        const { adminDashboard } = await import('./admin.dashboard.js');
        const capacity = adminDashboard.getCapacityProjections();

        expect(capacity.current).toBeDefined();
        expect(capacity.projections['30_days']).toBeDefined();
        expect(capacity.projections['90_days']).toBeDefined();
        expect(capacity.projections['365_days']).toBeDefined();
        expect(capacity.recommendations).toBeDefined();
    });

    it('should return tenant plan distribution', async () => {
        const { adminDashboard } = await import('./admin.dashboard.js');
        const overview = adminDashboard.getSystemOverview();

        expect(overview.tenants.planDistribution).toBeDefined();
        expect(overview.tenants.planDistribution.starter).toBeDefined();
        expect(overview.tenants.planDistribution.sp500).toBeDefined();
    });
});

// ═══════════════════════════════════════════════
// Cross-Phase Integration
// ═══════════════════════════════════════════════

describe('Phases 36-37 Cross Integration', () => {
    it('should export all new modules from barrel index', async () => {
        const enterprise = await import('./index.js');
        expect(enterprise.multiRegion).toBeDefined();
        expect(enterprise.adminDashboard).toBeDefined();
    });

    it('should integrate admin dashboard with multi-region', async () => {
        const { adminDashboard } = await import('./admin.dashboard.js');
        const summary = adminDashboard.generateExecutiveSummary();

        // Executive summary should include infrastructure/cluster info
        expect(summary.infrastructure.clusters).toBeGreaterThanOrEqual(1);
        expect(summary.infrastructure.failoverMode).toBeDefined();
        expect(summary.infrastructure.rtoTarget).toBeDefined();
    });
});
