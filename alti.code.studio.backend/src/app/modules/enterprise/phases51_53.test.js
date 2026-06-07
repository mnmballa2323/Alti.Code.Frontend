/**
 * Copyright (c) 2024 Inso Code
 * 
 * ENTERPRISE PHASES 51-53 TEST SUITE
 * Agent Marketplace + Cron Engine + Admin Console
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../shared/logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

vi.mock('../agents/agent.registry.js', () => ({
    agentRegistry: { agents: [], register: vi.fn(), get: vi.fn(), list: vi.fn(() => []), findByCapability: vi.fn(() => []), get count() { return 0; } }
}));

vi.mock('../legion/legion.factory.js', () => ({
    legionFactory: { getProcessor: vi.fn(() => async () => ({ result: 'test' })) }
}));

// ═══════════════════════════════════════════════
// Phase 51: Agent Marketplace
// ═══════════════════════════════════════════════

describe('Phase 51: Agent Marketplace', () => {
    it('should publish an agent listing', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const result = agentMarketplace.publish({
            name: 'Code Review Bot',
            description: 'Automated code review agent',
            publisherId: 'pub_001',
            category: 'code-review',
            pricing: { model: 'free', pricePerMonth: 0 },
        });
        expect(result.listingId).toMatch(/^mkt_/);
        expect(result.name).toBe('Code Review Bot');
        expect(result.category).toBe('code-review');
    });

    it('should install and uninstall agent', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const pub = agentMarketplace.publish({ name: 'Security Scanner', publisherId: 'pub_002' });

        const install = agentMarketplace.install('jpmorgan', pub.listingId);
        expect(install.installed).toBe(true);

        const dup = agentMarketplace.install('jpmorgan', pub.listingId);
        expect(dup.alreadyInstalled).toBe(true);

        const uninstall = agentMarketplace.uninstall('jpmorgan', pub.listingId);
        expect(uninstall.uninstalled).toBe(true);
    });

    it('should leave reviews and compute average rating', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const pub = agentMarketplace.publish({ name: 'Review Bot', publisherId: 'pub_003' });

        agentMarketplace.review(pub.listingId, 'user1', 5, 'Excellent!');
        const result = agentMarketplace.review(pub.listingId, 'user2', 3, 'Good');

        expect(result.averageRating).toBe(4);
    });

    it('should publish new version', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const pub = agentMarketplace.publish({ name: 'Versioned Bot', publisherId: 'pub_004' });
        const updated = agentMarketplace.publishVersion(pub.listingId, '2.0.0', 'Major update');

        expect(updated.version).toBe('2.0.0');
        expect(updated.totalVersions).toBe(2);
    });

    it('should browse with filters', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const results = agentMarketplace.browse({ category: 'code-review' });
        expect(results.total).toBeGreaterThanOrEqual(1);
    });

    it('should enforce dependencies on install', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const dep = agentMarketplace.publish({ name: 'Base Agent', publisherId: 'pub' });
        agentMarketplace.publish({
            name: 'Ext Agent',
            publisherId: 'pub',
            dependencies: [dep.listingId],
        });

        // Try to install extension without base → should fail
        const listings = agentMarketplace.browse({});
        const ext = listings.listings.find(l => l.name === 'Ext Agent');
        expect(() => agentMarketplace.install('newTenant', ext.id)).toThrow(/Missing dependency/);
    });

    it('should have 15 categories and 4 badges', async () => {
        const { CATEGORIES, BADGES } = await import('./agent.marketplace.js');
        expect(CATEGORIES.length).toBe(15);
        expect(Object.keys(BADGES).length).toBe(4);
    });

    it('should get installed list for tenant', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const pub = agentMarketplace.publish({ name: 'Installed Bot', publisherId: 'pub_t' });
        agentMarketplace.install('test_tenant', pub.listingId);
        const installed = agentMarketplace.getInstalled('test_tenant');
        expect(installed.length).toBeGreaterThanOrEqual(1);
    });

    it('should provide marketplace analytics', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const analytics = agentMarketplace.getAnalytics();
        expect(analytics.totalListings).toBeGreaterThan(0);
        expect(analytics.revenueShare.publisher).toBe(0.70);
    });

    it('should report stats', async () => {
        const { agentMarketplace } = await import('./agent.marketplace.js');
        const stats = agentMarketplace.getStats();
        expect(stats.totalListings).toBeGreaterThan(0);
        expect(stats.categories.length).toBe(15);
        expect(stats.badges.length).toBe(4);
    });
});

// ═══════════════════════════════════════════════
// Phase 52: Cron Engine
// ═══════════════════════════════════════════════

describe('Phase 52: Cron Engine', () => {
    it('should schedule a job with cron expression', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const result = cronEngine.scheduleJob({
            name: 'Daily Backup',
            schedule: '@daily',
            action: { type: 'agent', agentName: 'backup-agent' },
        });
        expect(result.jobId).toMatch(/^job_/);
        expect(result.schedule).toBe('0 0 * * *');
        expect(result.nextRun).toBeDefined();
    });

    it('should execute a job successfully', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const job = cronEngine.scheduleJob({
            name: 'Test Job',
            schedule: '*/5 * * * *',
            action: { type: 'agent', agentName: 'test' },
        });
        const exec = await cronEngine.executeJob(job.jobId);
        expect(exec.status).toBe('COMPLETED');
        expect(exec.duration).toBeGreaterThanOrEqual(0);
        expect(exec.result.dispatched).toBe('test');
    });

    it('should pause, resume, and cancel jobs', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const job = cronEngine.scheduleJob({ name: 'Lifecycle Job', schedule: '@hourly' });

        const paused = cronEngine.pauseJob(job.jobId);
        expect(paused.status).toBe('PAUSED');

        const resumed = cronEngine.resumeJob(job.jobId);
        expect(resumed.status).toBe('ACTIVE');
        expect(resumed.nextRun).toBeDefined();

        const cancelled = cronEngine.cancelJob(job.jobId);
        expect(cancelled.status).toBe('CANCELLED');
    });

    it('should expire job after max executions', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const job = cronEngine.scheduleJob({
            name: 'Finite Job',
            schedule: '* * * * *',
            maxExecutions: 1,
        });

        await cronEngine.executeJob(job.jobId);
        const jobData = cronEngine.getJob(job.jobId);
        expect(jobData.status).toBe('EXPIRED');
    });

    it('should have 9 schedule presets', async () => {
        const { CRON_PRESETS } = await import('./cron.engine.js');
        expect(Object.keys(CRON_PRESETS).length).toBe(9);
        expect(CRON_PRESETS['@hourly']).toBe('0 * * * *');
    });

    it('should validate cron expressions', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        expect(() => cronEngine.scheduleJob({ name: 'Bad', schedule: 'invalid' })).toThrow();
    });

    it('should support multiple action types', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const wfJob = cronEngine.scheduleJob({
            name: 'Workflow Cron',
            schedule: '@daily',
            action: { type: 'workflow', workflowId: 'wf_123' },
        });
        const exec = await cronEngine.executeJob(wfJob.jobId);
        expect(exec.result.triggered).toBe(true);
    });

    it('should list and filter jobs', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const jobs = cronEngine.listJobs();
        expect(jobs.length).toBeGreaterThan(0);
        expect(jobs[0].schedule).toBeDefined();
    });

    it('should track execution history', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const history = cronEngine.getExecutionHistory();
        expect(history.length).toBeGreaterThan(0);
        expect(history[0].status).toBeDefined();
    });

    it('should report stats', async () => {
        const { cronEngine } = await import('./cron.engine.js');
        const stats = cronEngine.getStats();
        expect(stats.totalJobs).toBeGreaterThan(0);
        expect(stats.presets.length).toBe(9);
        expect(stats.successRate).toBeDefined();
    });
});

// ═══════════════════════════════════════════════
// Phase 53: Admin Console
// ═══════════════════════════════════════════════

describe('Phase 53: Admin Console', () => {
    it('should create a tenant', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const tenant = adminConsole.createTenant({
            name: 'Goldman Sachs',
            domain: 'gs.com',
            plan: 'enterprise',
        });
        expect(tenant.id).toMatch(/^tenant_/);
        expect(tenant.status).toBe('ACTIVE');
    });

    it('should suspend and reactivate tenant', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const tenant = adminConsole.createTenant({ name: 'Test Corp', plan: 'starter' });

        const suspended = adminConsole.suspendTenant(tenant.id, 'Non-payment');
        expect(suspended.status).toBe('SUSPENDED');

        const reactivated = adminConsole.reactivateTenant(tenant.id);
        expect(reactivated.status).toBe('ACTIVE');
    });

    it('should provision and deprovision users', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const tenant = adminConsole.createTenant({ name: 'User Test' });

        const user = adminConsole.provisionUser({
            email: 'john@test.com',
            name: 'John',
            tenantId: tenant.id,
            role: 'admin',
        });
        expect(user.id).toMatch(/^user_/);
        expect(user.status).toBe('ACTIVE');

        const deprovisioned = adminConsole.deprovisionUser(user.id);
        expect(deprovisioned.status).toBe('DEPROVISIONED');
    });

    it('should manage teams and members', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const tenant = adminConsole.createTenant({ name: 'Team Test' });

        const user = adminConsole.provisionUser({ email: 'team@test.com', name: 'TeamUser', tenantId: tenant.id });
        const team = adminConsole.createTeam({ name: 'Engineering', tenantId: tenant.id });
        expect(team.id).toMatch(/^team_/);

        const added = adminConsole.addTeamMember(team.id, user.id);
        expect(added.added).toBe(true);

        const removed = adminConsole.removeTeamMember(team.id, user.id);
        expect(removed.removed).toBe(true);
    });

    it('should toggle maintenance mode', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const result = adminConsole.setMaintenanceMode(true, 'Scheduled downtime');
        expect(result.maintenanceMode).toBe(true);

        const state = adminConsole.getSystemState();
        expect(state.maintenanceMode).toBe(true);

        adminConsole.setMaintenanceMode(false);
    });

    it('should manage feature flags', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const result = adminConsole.setFeatureFlag('advanced_analytics', true);
        expect(result.enabled).toBe(true);
        expect(() => adminConsole.setFeatureFlag('nonexistent', true)).toThrow(/Unknown feature flag/);
    });

    it('should have 8 feature flags and 5 admin roles', async () => {
        const { FEATURE_FLAGS, ADMIN_ROLES } = await import('./admin.console.js');
        expect(Object.keys(FEATURE_FLAGS).length).toBe(8);
        expect(ADMIN_ROLES.length).toBe(5);
    });

    it('should bulk invite users', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const tenant = adminConsole.createTenant({ name: 'Bulk Test' });
        const result = adminConsole.bulkInvite(tenant.id, ['a@t.com', 'b@t.com', 'c@t.com']);
        expect(result.invited).toBe(3);
    });

    it('should add announcements', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const ann = adminConsole.addAnnouncement('System update at midnight', 'WARNING');
        expect(ann.id).toMatch(/^ann_/);
        expect(ann.severity).toBe('WARNING');
    });

    it('should maintain audit log', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const log = adminConsole.getAuditLog();
        expect(log.length).toBeGreaterThan(0);
        expect(log[0].action).toBeDefined();
    });

    it('should report stats', async () => {
        const { adminConsole } = await import('./admin.console.js');
        const stats = adminConsole.getStats();
        expect(stats.totalTenants).toBeGreaterThan(0);
        expect(stats.totalUsers).toBeGreaterThan(0);
        expect(stats.adminRoles.length).toBe(5);
        expect(stats.featureFlags).toBe(8);
    });
});

// ═══════════════════════════════════════════════
// Cross Integration
// ═══════════════════════════════════════════════

describe('Phases 51-53 Cross Integration', () => {
    it('should export all modules from barrel index', async () => {
        const enterprise = await import('./index.js');
        expect(enterprise.agentMarketplace).toBeDefined();
        expect(enterprise.CATEGORIES).toBeDefined();
        expect(enterprise.cronEngine).toBeDefined();
        expect(enterprise.CRON_PRESETS).toBeDefined();
        expect(enterprise.adminConsole).toBeDefined();
        expect(enterprise.ADMIN_ROLES).toBeDefined();
    });

    it('should schedule marketplace agent via cron', async () => {
        const { agentMarketplace, cronEngine } = await import('./index.js');
        const pub = agentMarketplace.publish({ name: 'Scheduled Bot', publisherId: 'p1' });
        const job = cronEngine.scheduleJob({
            name: 'Run Scheduled Bot',
            schedule: '@hourly',
            action: { type: 'agent', agentName: pub.name },
        });
        const exec = await cronEngine.executeJob(job.jobId);
        expect(exec.status).toBe('COMPLETED');
    });

    it('should provision user and install marketplace agent', async () => {
        const { adminConsole, agentMarketplace } = await import('./index.js');
        const tenant = adminConsole.createTenant({ name: 'Int Test Org' });
        adminConsole.provisionUser({ email: 'int@test.com', name: 'IntUser', tenantId: tenant.id });
        const pub = agentMarketplace.publish({ name: 'Int Agent', publisherId: 'p2' });
        const installed = agentMarketplace.install(tenant.id, pub.listingId);
        expect(installed.installed).toBe(true);
    });
});
