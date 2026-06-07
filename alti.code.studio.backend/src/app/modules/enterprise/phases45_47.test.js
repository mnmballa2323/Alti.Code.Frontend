/**
 * Copyright (c) 2024 Inso Code
 * 
 * ENTERPRISE PHASES 45 & 47 TEST SUITE
 * Tenant Quota Metering + Enterprise Notification Center
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
// Phase 45: Tenant Quota & Usage Metering
// ═══════════════════════════════════════════════

describe('Phase 45: Tenant Quota & Usage Metering', () => {
    it('should initialize tenant with plan quotas', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        const usage = quotaMeter.initTenant('jpmorgan', 'enterprise');
        expect(usage.tenantId).toBe('jpmorgan');
        expect(usage.plan).toBe('enterprise');
        expect(usage.quotas.agents).toBe(200);
        expect(usage.quotas.tokensPerMonth).toBe(100_000_000);
        expect(usage.quotas.concurrentJobs).toBe(100);
    });

    it('should support 4 plan tiers', async () => {
        const { PLAN_QUOTAS } = await import('./quota.meter.js');

        expect(Object.keys(PLAN_QUOTAS)).toEqual(['starter', 'professional', 'enterprise', 'sp500']);
        expect(PLAN_QUOTAS.starter.agents).toBe(10);
        expect(PLAN_QUOTAS.sp500.agents).toBe(Infinity);
    });

    it('should record usage and return percent used', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('usage-test', 'starter');
        const result = quotaMeter.recordUsage('usage-test', 'agents', 3);

        expect(result.resource).toBe('agents');
        expect(result.current).toBe(3);
        expect(result.limit).toBe(10);
        expect(result.percentUsed).toBe(30);
        expect(result.remaining).toBe(7);
    });

    it('should trigger warning at 80% usage', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('warning-test', 'starter');
        quotaMeter.recordUsage('warning-test', 'agents', 9); // 90% of 10

        const alerts = quotaMeter.getAlerts('warning-test');
        expect(alerts.length).toBeGreaterThanOrEqual(1);
        expect(alerts.some(a => a.type === 'WARNING')).toBe(true);
    });

    it('should trigger overage at 100% usage', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('overage-test', 'starter');
        quotaMeter.recordUsage('overage-test', 'agents', 11); // > 10

        const alerts = quotaMeter.getAlerts('overage-test');
        expect(alerts.some(a => a.type === 'OVERAGE' && a.tenantId === 'overage-test')).toBe(true);
    });

    it('should check quota and return allowed status', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('check-test', 'professional');
        quotaMeter.recordUsage('check-test', 'agents', 20);

        const check = quotaMeter.checkQuota('check-test', 'agents');
        expect(check.allowed).toBe(true);
        expect(check.current).toBe(20);
        expect(check.limit).toBe(50);
    });

    it('should deny when quota exceeded', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('deny-test', 'starter');
        quotaMeter.recordUsage('deny-test', 'agents', 10);

        const check = quotaMeter.checkQuota('deny-test', 'agents');
        expect(check.allowed).toBe(false);
    });

    it('should generate usage dashboard', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('dashboard-test', 'enterprise');
        quotaMeter.recordUsage('dashboard-test', 'tokens', 50_000_000);
        quotaMeter.recordUsage('dashboard-test', 'api_calls', 2_000_000);

        const dashboard = quotaMeter.getUsageDashboard('dashboard-test');
        expect(dashboard.plan).toBe('enterprise');
        expect(dashboard.resources.tokensUsed.percentUsed).toBe(50);
        expect(dashboard.resources.apiCalls.status).toBe('OK');
    });

    it('should generate invoice with line-item pricing', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('invoice-test', 'professional');
        quotaMeter.recordUsage('invoice-test', 'tokens', 15_000_000); // 5M overage
        quotaMeter.recordUsage('invoice-test', 'api_calls', 600_000); // 100K overage

        const invoice = quotaMeter.generateInvoice('invoice-test');
        expect(invoice.id).toMatch(/^inv_/);
        expect(invoice.lineItems.length).toBeGreaterThanOrEqual(2); // base + overages
        expect(invoice.currency).toBe('USD');
        expect(invoice.total).toBeGreaterThan(499); // base plan
    });

    it('should release usage when jobs complete', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('release-test', 'starter');
        quotaMeter.recordUsage('release-test', 'jobs', 3);
        quotaMeter.releaseUsage('release-test', 'jobs', 2);

        const check = quotaMeter.checkQuota('release-test', 'jobs');
        expect(check.current).toBe(1);
    });

    it('should forecast usage for billing period', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        quotaMeter.initTenant('forecast-test', 'enterprise');
        quotaMeter.recordUsage('forecast-test', 'tokens', 30_000_000);

        // Backdate period start so progress > 0
        const usage = quotaMeter.tenantUsage.get('forecast-test');
        usage.periodStart = new Date(Date.now() - 15 * 86400000).toISOString(); // 15 days ago

        const forecast = quotaMeter.forecast('forecast-test');
        expect(forecast).not.toBeNull();
        expect(forecast.projections.tokensUsed).toBeDefined();
        expect(forecast.projections.tokensUsed.current).toBe(30_000_000);
    });

    it('should report metering stats', async () => {
        const { quotaMeter } = await import('./quota.meter.js');

        const stats = quotaMeter.getStats();
        expect(stats.tenantsMetered).toBeGreaterThanOrEqual(1);
        expect(stats.plans.length).toBe(4);
    });
});

// ═══════════════════════════════════════════════
// Phase 47: Enterprise Notification Center
// ═══════════════════════════════════════════════

describe('Phase 47: Enterprise Notification Center', () => {
    it('should send notification via template', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        const result = notificationCenter.send({
            tenantId: 'jpmorgan',
            templateId: 'agent.completed',
            severity: 'INFO',
            variables: {
                agentName: 'codeReview',
                task: 'Audit auth module',
                tenantId: 'jpmorgan',
                duration: 1250,
                tokens: 4500,
            },
        });

        expect(result.sent).toBeGreaterThanOrEqual(1);
        expect(result.channels).toContain('in_app');
    });

    it('should route critical notifications to all channels', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        const result = notificationCenter.send({
            tenantId: 'goldman',
            templateId: 'security.breach',
            severity: 'EMERGENCY',
            variables: { event: 'Unauthorized access', ip: '10.0.0.1', action: 'blocked' },
        });

        expect(result.channels).toContain('sms');
        expect(result.channels).toContain('email');
        expect(result.channels).toContain('push');
        expect(result.channels).toContain('webhook');
    });

    it('should have 10 default templates', async () => {
        const { DEFAULT_TEMPLATES } = await import('./notification.center.js');
        expect(Object.keys(DEFAULT_TEMPLATES).length).toBe(10);
    });

    it('should interpolate template variables', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        const result = notificationCenter.send({
            tenantId: 'interp-test',
            templateId: 'quota.exceeded',
            variables: { resource: 'tokens', tenantId: 'interp-test', current: 15000000, limit: 10000000 },
        });

        const inApp = result.notifications.find(n => n.channel === 'in_app');
        expect(inApp.subject).toContain('tokens');
        expect(inApp.body).toContain('15000000');
    });

    it('should manage in-app inbox (unread/read)', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        // Send some in-app notifications
        notificationCenter.send({ tenantId: 'inbox-test', subject: 'Test 1', channels: ['in_app'] });
        notificationCenter.send({ tenantId: 'inbox-test', subject: 'Test 2', channels: ['in_app'] });

        const inbox = notificationCenter.getInbox('inbox-test');
        expect(inbox.total).toBeGreaterThanOrEqual(2);
        expect(inbox.unread).toBeGreaterThanOrEqual(2);

        // Mark one as read
        const notifId = inbox.notifications[0].id;
        notificationCenter.markRead(notifId);

        const updated = notificationCenter.getInbox('inbox-test');
        expect(updated.unread).toBe(inbox.unread - 1);
    });

    it('should mark all as read', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        notificationCenter.send({ tenantId: 'mark-all-test', subject: 'A', channels: ['in_app'] });
        notificationCenter.send({ tenantId: 'mark-all-test', subject: 'B', channels: ['in_app'] });

        const result = notificationCenter.markAllRead('mark-all-test');
        expect(result.marked).toBeGreaterThanOrEqual(2);

        const inbox = notificationCenter.getInbox('mark-all-test');
        expect(inbox.unread).toBe(0);
    });

    it('should set and retrieve notification preferences', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        notificationCenter.setPreferences('pref-test', {
            digest: 'daily',
            muted: ['sms'],
            email: 'admin@test.com',
        });

        const prefs = notificationCenter.getPreferences('pref-test');
        expect(prefs.digest).toBe('daily');
        expect(prefs.muted).toContain('sms');
    });

    it('should queue non-critical notifications for digest', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        notificationCenter.setPreferences('digest-test', { digest: 'daily' });

        const result = notificationCenter.send({
            tenantId: 'digest-test',
            subject: 'Low priority',
            severity: 'INFO',
            channels: ['in_app'],
        });

        expect(result.queued).toBe(true);
    });

    it('should still send CRITICAL even with digest enabled', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        notificationCenter.setPreferences('digest-critical', { digest: 'daily' });

        const result = notificationCenter.send({
            tenantId: 'digest-critical',
            subject: 'Server on fire',
            severity: 'CRITICAL',
            channels: ['in_app', 'email', 'sms'],
        });

        expect(result.sent).toBeGreaterThanOrEqual(1); // Not queued
    });

    it('should flush digest queue', async () => {
        const { notificationCenter } = await import('./notification.center.js');

        notificationCenter.setPreferences('flush-test', { digest: 'hourly' });
        notificationCenter.send({ tenantId: 'flush-test', subject: 'A', severity: 'INFO', channels: ['email'] });
        notificationCenter.send({ tenantId: 'flush-test', subject: 'B', severity: 'INFO', channels: ['email'] });

        const result = notificationCenter.flushDigest('flush-test');
        expect(result.flushed).toBeGreaterThanOrEqual(2);
    });

    it('should provide notification analytics', async () => {
        const { notificationCenter } = await import('./notification.center.js');
        const analytics = notificationCenter.getAnalytics();

        expect(analytics.total).toBeGreaterThan(0);
        expect(analytics.byChannel).toBeDefined();
        expect(analytics.bySeverity).toBeDefined();
        expect(analytics.inAppReadRate).toBeDefined();
    });

    it('should support 5 notification channels', async () => {
        const { NOTIFICATION_CHANNELS } = await import('./notification.center.js');
        expect(NOTIFICATION_CHANNELS.length).toBe(5);
        expect(NOTIFICATION_CHANNELS).toContain('email');
        expect(NOTIFICATION_CHANNELS).toContain('sms');
        expect(NOTIFICATION_CHANNELS).toContain('push');
    });

    it('should report stats', async () => {
        const { notificationCenter } = await import('./notification.center.js');
        const stats = notificationCenter.getStats();

        expect(stats.totalSent).toBeGreaterThan(0);
        expect(stats.templates).toBe(10);
        expect(stats.supportedChannels.length).toBe(5);
    });
});

// ═══════════════════════════════════════════════
// Cross Integration
// ═══════════════════════════════════════════════

describe('Phases 45 & 47 Cross Integration', () => {
    it('should export all modules from barrel index', async () => {
        const enterprise = await import('./index.js');

        // Phase 45
        expect(enterprise.quotaMeter).toBeDefined();
        expect(enterprise.PLAN_QUOTAS).toBeDefined();

        // Phase 47
        expect(enterprise.notificationCenter).toBeDefined();
        expect(enterprise.NOTIFICATION_CHANNELS).toBeDefined();
        expect(enterprise.SEVERITY_ROUTES).toBeDefined();
        expect(enterprise.DIGEST_SCHEDULES).toBeDefined();
        expect(enterprise.DEFAULT_TEMPLATES).toBeDefined();
    });

    it('should trigger notification on quota overage', async () => {
        const { quotaMeter, notificationCenter } = await import('./index.js');

        quotaMeter.initTenant('cross-quota', 'starter');
        quotaMeter.recordUsage('cross-quota', 'agents', 11);

        const result = notificationCenter.send({
            tenantId: 'cross-quota',
            templateId: 'quota.exceeded',
            severity: 'WARNING',
            variables: { resource: 'agents', tenantId: 'cross-quota', current: 11, limit: 10 },
        });

        expect(result.sent).toBeGreaterThanOrEqual(1);
        const inbox = notificationCenter.getInbox('cross-quota');
        expect(inbox.total).toBeGreaterThanOrEqual(1);
    });

    it('should generate invoice and notify tenant', async () => {
        const { quotaMeter, notificationCenter } = await import('./index.js');

        quotaMeter.initTenant('invoice-notify', 'professional');
        quotaMeter.recordUsage('invoice-notify', 'tokens', 12_000_000);
        const invoice = quotaMeter.generateInvoice('invoice-notify');

        const notif = notificationCenter.send({
            tenantId: 'invoice-notify',
            templateId: 'invoice.generated',
            variables: { invoiceId: invoice.id, period: '2026-02', total: invoice.total, plan: 'professional' },
        });

        expect(notif.sent).toBeGreaterThanOrEqual(1);
        const inAppNotif = notif.notifications.find(n => n.channel === 'in_app');
        expect(inAppNotif.body).toContain(invoice.id);
    });
});
