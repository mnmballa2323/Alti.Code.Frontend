/**
 * Copyright (c) 2024 Inso Code
 * 
 * ENTERPRISE API ROUTES
 * 
 * REST endpoints for all enterprise features:
 *   - /enterprise/tenants     — Tenant management
 *   - /enterprise/compliance  — Compliance reports & data classification
 *   - /enterprise/costs       — Cost attribution
 *   - /enterprise/events      — Event bus queries
 *   - /enterprise/webhooks    — Webhook management
 *   - /enterprise/batches     — Batch processing
 *   - /enterprise/agents      — Agent SDK (versioning, marketplace)
 *   - /enterprise/health      — Health checks
 */

import { Router } from 'express';
import { rbac } from './rbac.middleware.js';
import { tenantService } from './tenant.service.js';
import { resultStore } from './result.store.js';
import { complianceEngine } from './compliance.engine.js';
import { eventBus } from './event.bus.js';
import { webhookDispatcher } from './event.bus.js';
import { batchProcessor } from './batch.processor.js';
import { agentSDK } from './agent.sdk.js';
import { healthChecker, resilientAI } from './resilience.js';
import { enterpriseBridge } from './enterprise.bridge.js';
import { metrics, tracer, dashboard } from './observability.js';
import { multiRegion } from './multi.region.js';
import { adminDashboard } from './admin.dashboard.js';
import { apiKeyManager, rateLimiter } from './api.keys.js';
import { cacheController } from './cache.layer.js';
import { dlq, retryPolicy, schemaValidator, errorBudget } from './error.recovery.js';
import { auditExporter } from './audit.exporter.js';
import { wsFeed } from './websocket.feed.js';
import { secretManager } from './secret.rotation.js';
import { quotaMeter } from './quota.meter.js';
import { notificationCenter } from './notification.center.js';
import { workflowEngine } from './workflow.engine.js';
import { dataPipeline } from './data.pipeline.js';
import { enterpriseSearch } from './enterprise.search.js';
import { agentMarketplace } from './agent.marketplace.js';
import { cronEngine } from './cron.engine.js';
import { adminConsole } from './admin.console.js';
import { healthCheck } from './health.check.js';
import { openAPIGenerator } from './openapi.generator.js';
import { stressTestEngine } from './stress.test.engine.js';
import { costAnalytics } from './cost.analytics.js';
import { perfBenchmark } from './perf.benchmark.js';
import { tokenBilling } from './token.billing.js';
import { webhookManager } from './webhook.manager.js';
import { dataExportImport } from './data.export.import.js';
import { dashboardBuilder } from './dashboard.builder.js';
import { agentCollaboration } from './agent.collaboration.js';
import { tenantMigration } from './tenant.migration.js';
import { complianceCertification } from './compliance.certification.js';
import { logger } from '../../../shared/logger.js';

const router = Router();

// ═══════════════════════════════════════════════
// Health Check (public — no auth required)
// ═══════════════════════════════════════════════

router.get('/health', async (req, res) => {
    try {
        const health = await healthChecker.check();
        const aiHealth = resilientAI.getHealth();
        res.status(health.status === 'healthy' ? 200 : 503).json({ ...health, aiProviders: aiHealth });
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.message });
    }
});

router.get('/health/ready', (req, res) => {
    res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
});

router.get('/health/live', (req, res) => {
    res.status(200).json({ live: true, timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════
// Tenant Management
// ═══════════════════════════════════════════════

router.get('/tenants', rbac('tenants:configure'), (req, res) => {
    res.json({ tenants: tenantService.list(), count: tenantService.count });
});

router.post('/tenants', rbac('tenants:configure'), (req, res) => {
    try {
        const tenant = tenantService.register(req.body);
        res.status(201).json(tenant);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// Cost Attribution
// ═══════════════════════════════════════════════

router.get('/costs', rbac('costs:read'), async (req, res) => {
    const costs = await resultStore.getCostAttribution(req.tenantId, {
        since: req.query.since,
        until: req.query.until,
    });
    res.json(costs);
});

router.get('/costs/export', rbac('costs:export'), async (req, res) => {
    const costs = await resultStore.getCostAttribution(req.tenantId, {
        since: req.query.since,
        until: req.query.until,
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cost_report.csv"');

    let csv = 'Type,Name,Tokens,Requests,Duration(ms)\n';
    for (const [name, data] of Object.entries(costs.byAgent)) {
        csv += `Agent,${name},${data.tokens},${data.requests},${data.durationMs}\n`;
    }
    for (const [name, data] of Object.entries(costs.bySquad)) {
        csv += `Squad,${name},${data.tokens},${data.requests},\n`;
    }
    res.send(csv);
});

// ═══════════════════════════════════════════════
// Compliance
// ═══════════════════════════════════════════════

router.get('/compliance/report', rbac('compliance:read'), (req, res) => {
    const frameworks = req.query.frameworks?.split(',') || ['sox', 'hipaa', 'pci-dss', 'gdpr', 'fedramp'];
    const report = complianceEngine.generateReport(req.tenantId, frameworks);
    res.json(report);
});

router.post('/compliance/classify', rbac('compliance:read'), (req, res) => {
    const result = complianceEngine.classifyData(req.body.text || '');
    res.json(result);
});

router.post('/compliance/erasure', rbac('compliance:read'), async (req, res) => {
    const request = await complianceEngine.requestErasure(
        req.tenantId,
        req.identity.userId,
        req.body.reason || 'GDPR Article 17 request'
    );
    res.status(201).json(request);
});

// ═══════════════════════════════════════════════
// Events & Webhooks
// ═══════════════════════════════════════════════

router.get('/events', rbac('audit:read'), (req, res) => {
    const events = eventBus.query({
        tenantId: req.tenantId,
        type: req.query.type,
        since: req.query.since,
        limit: parseInt(req.query.limit) || 100,
    });
    res.json({ events, count: events.length });
});

router.get('/webhooks', rbac('webhooks:manage'), (req, res) => {
    res.json({ webhooks: webhookDispatcher.list(req.tenantId) });
});

router.post('/webhooks', rbac('webhooks:manage'), (req, res) => {
    const webhook = webhookDispatcher.register(req.tenantId, req.body);
    res.status(201).json(webhook);
});

// ═══════════════════════════════════════════════
// Batch Processing
// ═══════════════════════════════════════════════

router.get('/batches', rbac('agents:dispatch'), (req, res) => {
    res.json({ batches: batchProcessor.listBatches(req.tenantId) });
});

router.get('/batches/:id', rbac('agents:dispatch'), (req, res) => {
    const batch = batchProcessor.getStatus(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
});

// ═══════════════════════════════════════════════
// Agent SDK / Developer Platform
// ═══════════════════════════════════════════════

router.get('/agents/marketplace', rbac('agents:list'), (req, res) => {
    res.json({ listings: agentSDK.searchMarketplace(req.query) });
});

router.post('/agents/custom', rbac('agents:configure'), (req, res) => {
    try {
        const agent = agentSDK.defineCustomAgent(req.body, req.tenantId);
        res.status(201).json(agent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/agents/:name/version', rbac('agents:configure'), (req, res) => {
    try {
        const version = agentSDK.publishVersion(req.params.name, req.body);
        res.json({ agent: req.params.name, version });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/agents/:name/rollback', rbac('agents:configure'), (req, res) => {
    try {
        const result = agentSDK.rollback(req.params.name, req.body.targetVersion);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/agents/sdk/stats', rbac('agents:list'), (req, res) => {
    res.json(agentSDK.getStats());
});

// ═══════════════════════════════════════════════
// Agent Hub First-Party Provisioning (Phase 51)
// ═══════════════════════════════════════════════

router.get('/marketplace/browse', rbac('agents:list'), (req, res) => {
    res.json(agentMarketplace.browse(req.query));
});

router.post('/marketplace/install', rbac('tenants:configure'), (req, res) => {
    try {
        const result = agentMarketplace.install(req.body.tenantId, req.body.listingId);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/marketplace/uninstall', rbac('tenants:configure'), (req, res) => {
    res.json(agentMarketplace.uninstall(req.body.tenantId, req.body.listingId));
});

router.get('/marketplace/installed/:tenantId', rbac('audit:read'), (req, res) => {
    res.json({ installed: agentMarketplace.getInstalled(req.params.tenantId) });
});

// ═══════════════════════════════════════════════
// System Status
// ═══════════════════════════════════════════════

router.get('/status', rbac('audit:read'), (req, res) => {
    res.json({
        enterprise: true,
        modules: {
            sso: 'active',
            rbac: 'active',
            tenants: { count: tenantService.count },
            compliance: complianceEngine.getStats(),
            events: eventBus.getStats(),
            results: resultStore.getStats(),
            aiProviders: resilientAI.getHealth(),
            sdk: agentSDK.getStats(),
            bridge: enterpriseBridge.getStats(),
        },
        timestamp: new Date().toISOString(),
    });
});

// ═══════════════════════════════════════════════
// Observability (Phase 35)
// ═══════════════════════════════════════════════

router.get('/metrics', rbac('audit:read'), (req, res) => {
    res.json(metrics.toJSON());
});

router.get('/metrics/prometheus', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics.toPrometheus());
});

router.get('/traces', rbac('audit:read'), (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({
        traces: tracer.getRecentTraces(limit),
        stats: tracer.getStats(),
    });
});

router.get('/traces/:traceId', rbac('audit:read'), (req, res) => {
    const trace = tracer.getTrace(req.params.traceId);
    if (!trace.length) return res.status(404).json({ error: 'Trace not found' });
    res.json({ traceId: req.params.traceId, spans: trace });
});

router.get('/dashboard', rbac('audit:read'), (req, res) => {
    res.json(dashboard.getSystemSnapshot());
});

router.get('/dashboard/sla', rbac('audit:read'), (req, res) => {
    res.json(dashboard.getSLAReport());
});

router.get('/bridge/stats', rbac('audit:read'), (req, res) => {
    res.json(enterpriseBridge.getStats());
});

// ═══════════════════════════════════════════════
// Multi-Region Failover (Phase 36)
// ═══════════════════════════════════════════════

router.get('/regions', rbac('audit:read'), (req, res) => {
    res.json({ clusters: multiRegion.getClustersStatus(), stats: multiRegion.getStats() });
});

router.post('/regions', rbac('tenants:configure'), (req, res) => {
    try {
        const cluster = multiRegion.registerCluster(req.body.region, req.body.options || {});
        res.status(201).json(cluster);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/regions/health', rbac('audit:read'), async (req, res) => {
    const health = await multiRegion.checkAllHealth();
    res.json(health);
});

router.post('/regions/failover', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await multiRegion.triggerFailover(req.body.fromRegion, req.body.reason);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/regions/traffic', rbac('tenants:configure'), (req, res) => {
    try {
        const weights = multiRegion.setTrafficWeights(req.body.weights);
        res.json({ trafficWeights: weights });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/regions/dr', rbac('audit:read'), (req, res) => {
    res.json(multiRegion.getDisasterRecoveryStatus());
});

// ═══════════════════════════════════════════════
// Admin Dashboard (Phase 37)
// ═══════════════════════════════════════════════

router.get('/admin/overview', rbac('platform:manage'), (req, res) => {
    res.json(adminDashboard.getSystemOverview());
});

router.get('/admin/agents', rbac('platform:manage'), (req, res) => {
    res.json(adminDashboard.getAgentFleet());
});

router.get('/admin/tenants/:tenantId', rbac('tenants:configure'), (req, res) => {
    const analytics = adminDashboard.getTenantAnalytics(req.params.tenantId);
    if (analytics.error) return res.status(404).json(analytics);
    res.json(analytics);
});

router.get('/admin/executive-summary', rbac('platform:manage'), (req, res) => {
    res.json(adminDashboard.generateExecutiveSummary());
});

router.get('/admin/capacity', rbac('platform:manage'), (req, res) => {
    res.json(adminDashboard.getCapacityProjections());
});

// ═══════════════════════════════════════════════
// API Key Management (Phase 39)
// ═══════════════════════════════════════════════

router.post('/keys', rbac('tenants:configure'), (req, res) => {
    try {
        const result = apiKeyManager.generateKey(req.body.tenantId, req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/keys/:tenantId', rbac('audit:read'), (req, res) => {
    res.json({ keys: apiKeyManager.listKeys(req.params.tenantId) });
});

router.post('/keys/rotate', rbac('tenants:configure'), (req, res) => {
    try {
        const result = apiKeyManager.rotateKey(req.body.tenantId, req.body.keyId, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/keys/:tenantId/:keyId', rbac('tenants:configure'), (req, res) => {
    try {
        const result = apiKeyManager.revokeKey(req.params.tenantId, req.params.keyId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/rate-limits', rbac('audit:read'), (req, res) => {
    res.json({ tiers: rateLimiter.getTiers(), stats: rateLimiter.getStats() });
});

// ═══════════════════════════════════════════════
// Caching (Phase 40)
// ═══════════════════════════════════════════════

router.get('/cache/stats', rbac('audit:read'), (req, res) => {
    res.json(cacheController.getStats());
});

router.post('/cache/flush', rbac('tenants:configure'), async (req, res) => {
    const result = await cacheController.flush();
    res.json(result);
});

router.post('/cache/invalidate', rbac('tenants:configure'), async (req, res) => {
    const result = await cacheController.invalidateByTag(req.body.tag);
    res.json(result);
});

// ═══════════════════════════════════════════════
// Error Recovery (Phase 41)
// ═══════════════════════════════════════════════

router.get('/dlq', rbac('audit:read'), (req, res) => {
    res.json({ items: dlq.list(req.query), stats: dlq.getStats() });
});

router.post('/dlq/reprocess', rbac('tenants:configure'), (req, res) => {
    const batch = dlq.dequeue(req.body.limit || 10, req.body.filter || {});
    res.json({ reprocessing: batch.length, items: batch });
});

router.get('/retry-policies', rbac('audit:read'), (req, res) => {
    res.json(retryPolicy.listPolicies());
});

router.get('/schemas', rbac('audit:read'), (req, res) => {
    res.json(schemaValidator.listSchemas());
});

router.get('/error-budget', rbac('audit:read'), (req, res) => {
    res.json(errorBudget.getBudget());
});

router.get('/keys/stats', rbac('audit:read'), (req, res) => {
    res.json(apiKeyManager.getStats());
});

// ═══════════════════════════════════════════════
// Audit Log Export (Phase 42)
// ═══════════════════════════════════════════════

router.get('/audit/logs', rbac('audit:read'), (req, res) => {
    res.json(auditExporter.query(req.query));
});

router.get('/audit/export/:format', rbac('audit:read'), (req, res) => {
    const format = req.params.format;
    const filters = req.query;
    try {
        switch (format) {
            case 'json': res.type('application/json').send(auditExporter.exportJSON(filters)); break;
            case 'ndjson': res.type('application/x-ndjson').send(auditExporter.exportNDJSON(filters)); break;
            case 'csv': res.type('text/csv').set('Content-Disposition', 'attachment; filename=audit.csv').send(auditExporter.exportCSV(filters)); break;
            case 'cef': res.type('text/plain').send(auditExporter.exportCEF(filters)); break;
            case 'splunk': res.type('application/json').send(auditExporter.exportSplunkHEC(filters)); break;
            case 'datadog': res.type('application/json').send(auditExporter.exportDatadog(filters)); break;
            case 'elastic': res.type('application/x-ndjson').send(auditExporter.exportElastic(filters)); break;
            default: res.status(400).json({ error: `Unknown format: ${format}`, supported: ['json', 'ndjson', 'csv', 'cef', 'splunk', 'datadog', 'elastic'] });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/audit/sinks', rbac('tenants:configure'), (req, res) => {
    const sink = auditExporter.registerSink(req.body.name, req.body);
    res.status(201).json(sink);
});

router.get('/audit/sinks', rbac('audit:read'), (req, res) => {
    res.json({ sinks: auditExporter.listSinks() });
});

router.get('/audit/integrity', rbac('audit:read'), (req, res) => {
    res.json(auditExporter.verifyIntegrity());
});

router.get('/audit/stats', rbac('audit:read'), (req, res) => {
    res.json(auditExporter.getStats());
});

// ═══════════════════════════════════════════════
// WebSocket Feed (Phase 43)
// ═══════════════════════════════════════════════

router.post('/ws/connect', rbac('agents:dispatch'), (req, res) => {
    try {
        const conn = wsFeed.addConnection(req.body);
        res.status(201).json(conn);
    } catch (err) {
        res.status(429).json({ error: err.message });
    }
});

router.delete('/ws/:connectionId', rbac('agents:dispatch'), (req, res) => {
    wsFeed.removeConnection(req.params.connectionId);
    res.json({ disconnected: true });
});

router.post('/ws/:connectionId/subscribe', rbac('agents:dispatch'), (req, res) => {
    try {
        const result = wsFeed.subscribe(req.params.connectionId, req.body.channel);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/ws/broadcast', rbac('tenants:configure'), (req, res) => {
    const result = wsFeed.broadcast(req.body.channel, req.body.event);
    res.json(result);
});

router.get('/ws/connections', rbac('audit:read'), (req, res) => {
    res.json({ connections: wsFeed.getConnections(req.query.tenantId) });
});

router.get('/ws/channels', rbac('audit:read'), (req, res) => {
    res.json(wsFeed.getChannels());
});

router.get('/ws/messages', rbac('audit:read'), (req, res) => {
    res.json({ messages: wsFeed.getRecentMessages(req.query.channel, parseInt(req.query.limit) || 50) });
});

router.get('/ws/stats', rbac('audit:read'), (req, res) => {
    res.json(wsFeed.getStats());
});

// ═══════════════════════════════════════════════
// Secret Rotation (Phase 44)
// ═══════════════════════════════════════════════

router.post('/secrets', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await secretManager.createSecret(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/secrets', rbac('audit:read'), (req, res) => {
    res.json({ secrets: secretManager.listSecrets(req.query.tenantId) });
});

router.post('/secrets/:secretId/rotate', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await secretManager.rotateSecret(req.params.secretId, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/secrets/:secretId/rollback', rbac('tenants:configure'), (req, res) => {
    try {
        const result = secretManager.rollbackSecret(req.params.secretId, req.body.version);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/secrets/:secretId/versions', rbac('audit:read'), (req, res) => {
    res.json({ versions: secretManager.getVersionHistory(req.params.secretId) });
});

router.get('/secrets/expiring', rbac('audit:read'), (req, res) => {
    res.json(secretManager.checkExpiring(parseInt(req.query.days) || 30));
});

router.get('/secrets/compliance', rbac('audit:read'), (req, res) => {
    res.json(secretManager.getComplianceReport());
});

router.get('/secrets/stats', rbac('audit:read'), (req, res) => {
    res.json(secretManager.getStats());
});

// ═══════════════════════════════════════════════
// Tenant Quota & Usage Metering (Phase 45)
// ═══════════════════════════════════════════════

router.post('/quotas/init', rbac('tenants:configure'), (req, res) => {
    const usage = quotaMeter.initTenant(req.body.tenantId, req.body.plan);
    res.status(201).json(usage);
});

router.post('/quotas/record', rbac('agents:dispatch'), (req, res) => {
    try {
        const result = quotaMeter.recordUsage(req.body.tenantId, req.body.resource, req.body.amount);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/quotas/check/:tenantId/:resource', rbac('audit:read'), (req, res) => {
    res.json(quotaMeter.checkQuota(req.params.tenantId, req.params.resource));
});

router.get('/quotas/dashboard/:tenantId', rbac('audit:read'), (req, res) => {
    const dashboard = quotaMeter.getUsageDashboard(req.params.tenantId);
    if (!dashboard) return res.status(404).json({ error: 'Tenant not found' });
    res.json(dashboard);
});

router.post('/quotas/invoice/:tenantId', rbac('tenants:configure'), (req, res) => {
    try {
        const invoice = quotaMeter.generateInvoice(req.params.tenantId);
        res.json(invoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/quotas/forecast/:tenantId', rbac('audit:read'), (req, res) => {
    const forecast = quotaMeter.forecast(req.params.tenantId);
    if (!forecast) return res.status(404).json({ error: 'No data' });
    res.json(forecast);
});

router.get('/quotas/alerts', rbac('audit:read'), (req, res) => {
    res.json({ alerts: quotaMeter.getAlerts(req.query.tenantId) });
});

router.get('/quotas/stats', rbac('audit:read'), (req, res) => {
    res.json(quotaMeter.getStats());
});

// ═══════════════════════════════════════════════
// Enterprise Notification Center (Phase 47)
// ═══════════════════════════════════════════════

router.post('/notifications/send', rbac('agents:dispatch'), (req, res) => {
    const result = notificationCenter.send(req.body);
    res.json(result);
});

router.get('/notifications/inbox/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(notificationCenter.getInbox(req.params.tenantId, req.query));
});

router.post('/notifications/read/:notificationId', rbac('agents:dispatch'), (req, res) => {
    notificationCenter.markRead(req.params.notificationId);
    res.json({ read: true });
});

router.post('/notifications/read-all/:tenantId', rbac('agents:dispatch'), (req, res) => {
    res.json(notificationCenter.markAllRead(req.params.tenantId));
});

router.put('/notifications/preferences/:tenantId', rbac('tenants:configure'), (req, res) => {
    res.json(notificationCenter.setPreferences(req.params.tenantId, req.body));
});

router.get('/notifications/preferences/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(notificationCenter.getPreferences(req.params.tenantId));
});

router.post('/notifications/digest/:tenantId', rbac('tenants:configure'), (req, res) => {
    res.json(notificationCenter.flushDigest(req.params.tenantId));
});

router.get('/notifications/templates', rbac('audit:read'), (req, res) => {
    res.json(notificationCenter.listTemplates());
});

router.get('/notifications/analytics', rbac('audit:read'), (req, res) => {
    res.json(notificationCenter.getAnalytics(req.query.tenantId));
});

router.get('/notifications/stats', rbac('audit:read'), (req, res) => {
    res.json(notificationCenter.getStats());
});

// ═══════════════════════════════════════════════
// Workflow Engine (Phase 48)
// ═══════════════════════════════════════════════

router.post('/workflows/define', rbac('tenants:configure'), (req, res) => {
    try {
        res.status(201).json(workflowEngine.defineWorkflow(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/workflows/execute/:workflowId', rbac('agents:dispatch'), async (req, res) => {
    try {
        const result = await workflowEngine.executeWorkflow(req.params.workflowId, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/workflows/from-template/:templateId', rbac('tenants:configure'), (req, res) => {
    try {
        res.status(201).json(workflowEngine.createFromTemplate(req.params.templateId, req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/workflows', rbac('audit:read'), (req, res) => {
    res.json(workflowEngine.listWorkflows(req.query.tenantId));
});

router.get('/workflows/templates', rbac('audit:read'), (req, res) => {
    res.json(workflowEngine.listTemplates());
});

router.get('/workflows/executions', rbac('audit:read'), (req, res) => {
    res.json(workflowEngine.listExecutions(req.query.workflowId));
});

router.get('/workflows/:workflowId', rbac('audit:read'), (req, res) => {
    const wf = workflowEngine.getWorkflow(req.params.workflowId);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    res.json(wf);
});

router.get('/workflows/stats', rbac('audit:read'), (req, res) => {
    res.json(workflowEngine.getStats());
});

// ═══════════════════════════════════════════════
// Data Pipeline / ETL (Phase 49)
// ═══════════════════════════════════════════════

router.post('/pipelines/define', rbac('tenants:configure'), (req, res) => {
    try {
        res.status(201).json(dataPipeline.definePipeline(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/pipelines/execute/:pipelineId', rbac('agents:dispatch'), (req, res) => {
    try {
        const result = dataPipeline.executePipeline(req.params.pipelineId, req.body.data);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/pipelines/schemas', rbac('tenants:configure'), (req, res) => {
    res.status(201).json(dataPipeline.registerSchema(req.body.name, req.body));
});

router.get('/pipelines', rbac('audit:read'), (req, res) => {
    res.json(dataPipeline.listPipelines(req.query.tenantId));
});

router.get('/pipelines/schemas', rbac('audit:read'), (req, res) => {
    res.json(dataPipeline.listSchemas());
});

router.get('/pipelines/:pipelineId', rbac('audit:read'), (req, res) => {
    const pipe = dataPipeline.getPipeline(req.params.pipelineId);
    if (!pipe) return res.status(404).json({ error: 'Pipeline not found' });
    res.json(pipe);
});

router.get('/pipelines/stats', rbac('audit:read'), (req, res) => {
    res.json(dataPipeline.getStats());
});

// ═══════════════════════════════════════════════
// Enterprise Search (Phase 50)
// ═══════════════════════════════════════════════

router.post('/search/index', rbac('agents:dispatch'), (req, res) => {
    const result = enterpriseSearch.index(req.body);
    res.status(201).json(result);
});

router.get('/search', rbac('audit:read'), (req, res) => {
    const { q, type, tenantId, limit, offset, fuzzy, severity, from, to } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
    res.json(enterpriseSearch.search(q, {
        type, tenantId,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
        fuzzy: fuzzy === 'true',
        severity, from, to,
    }));
});

router.get('/search/suggest', rbac('audit:read'), (req, res) => {
    res.json({ suggestions: enterpriseSearch.suggest(req.query.q || '', parseInt(req.query.limit) || 10) });
});

router.get('/search/analytics', rbac('audit:read'), (req, res) => {
    res.json(enterpriseSearch.getAnalytics());
});

router.get('/search/stats', rbac('audit:read'), (req, res) => {
    res.json(enterpriseSearch.getStats());
});

// ═══════════════════════════════════════════════
// Agent Marketplace (Phase 51)
// ═══════════════════════════════════════════════

router.post('/marketplace/publish', rbac('tenants:configure'), (req, res) => {
    try {
        res.status(201).json(agentMarketplace.publish(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/marketplace/install', rbac('agents:dispatch'), (req, res) => {
    try {
        res.json(agentMarketplace.install(req.body.tenantId, req.body.listingId));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/marketplace/uninstall', rbac('agents:dispatch'), (req, res) => {
    res.json(agentMarketplace.uninstall(req.body.tenantId, req.body.listingId));
});

router.post('/marketplace/review', rbac('agents:dispatch'), (req, res) => {
    try {
        res.json(agentMarketplace.review(req.body.listingId, req.body.userId, req.body.rating, req.body.comment));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/marketplace/browse', rbac('audit:read'), (req, res) => {
    res.json(agentMarketplace.browse(req.query));
});

router.get('/marketplace/installed/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(agentMarketplace.getInstalled(req.params.tenantId));
});

router.get('/marketplace/analytics', rbac('audit:read'), (req, res) => {
    res.json(agentMarketplace.getAnalytics());
});

router.get('/marketplace/stats', rbac('audit:read'), (req, res) => {
    res.json(agentMarketplace.getStats());
});

router.get('/marketplace/:listingId', rbac('audit:read'), (req, res) => {
    const listing = agentMarketplace.getListing(req.params.listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
});

// ═══════════════════════════════════════════════
// Scheduled Jobs & Cron Engine (Phase 52)
// ═══════════════════════════════════════════════

router.post('/cron/schedule', rbac('tenants:configure'), (req, res) => {
    try {
        res.status(201).json(cronEngine.scheduleJob(req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/cron/execute/:jobId', rbac('agents:dispatch'), async (req, res) => {
    try {
        const result = await cronEngine.executeJob(req.params.jobId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/cron/pause/:jobId', rbac('tenants:configure'), (req, res) => {
    try { res.json(cronEngine.pauseJob(req.params.jobId)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/cron/resume/:jobId', rbac('tenants:configure'), (req, res) => {
    try { res.json(cronEngine.resumeJob(req.params.jobId)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/cron/cancel/:jobId', rbac('tenants:configure'), (req, res) => {
    try { res.json(cronEngine.cancelJob(req.params.jobId)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/cron/jobs', rbac('audit:read'), (req, res) => {
    res.json(cronEngine.listJobs(req.query.tenantId));
});

router.get('/cron/due', rbac('audit:read'), (req, res) => {
    res.json({ due: cronEngine.getDueJobs() });
});

router.get('/cron/history/:jobId', rbac('audit:read'), (req, res) => {
    res.json(cronEngine.getExecutionHistory(req.params.jobId));
});

router.get('/cron/stats', rbac('audit:read'), (req, res) => {
    res.json(cronEngine.getStats());
});

// ═══════════════════════════════════════════════
// Admin Console (Phase 53)
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// Admin Console (Phase 53) - PostgreSQL/Prisma Persisted
// ═══════════════════════════════════════════════

router.post('/admin/tenants', rbac('platform:manage'), async (req, res, next) => {
    try {
        const result = await adminConsole.createTenant(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.put('/admin/tenants/:tenantId', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await adminConsole.updateTenant(req.params.tenantId, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/admin/tenants/:tenantId/suspend', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await adminConsole.suspendTenant(req.params.tenantId, req.body.reason);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/admin/tenants/:tenantId/reactivate', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await adminConsole.reactivateTenant(req.params.tenantId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/admin/tenants', rbac('platform:manage'), async (req, res, next) => {
    try {
        const result = await adminConsole.listTenants(req.query);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/users', rbac('tenants:configure'), async (req, res, next) => {
    try {
        const result = await adminConsole.provisionUser(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.delete('/admin/users/:userId', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await adminConsole.deprovisionUser(req.params.userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/admin/users', rbac('audit:read'), async (req, res, next) => {
    try {
        const result = await adminConsole.listUsers(req.query.tenantId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/users/bulk-invite', rbac('tenants:configure'), async (req, res, next) => {
    try {
        const result = await adminConsole.bulkInvite(req.body.tenantId, req.body.emails);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/teams', rbac('tenants:configure'), async (req, res, next) => {
    try {
        const result = await adminConsole.createTeam(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/teams/:teamId/members', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await adminConsole.addTeamMember(req.params.teamId, req.body.userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/admin/teams/:teamId/members/:userId', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await adminConsole.removeTeamMember(req.params.teamId, req.params.userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/admin/teams', rbac('audit:read'), async (req, res, next) => {
    try {
        const result = await adminConsole.listTeams(req.query.tenantId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/maintenance', rbac('platform:manage'), (req, res) => {
    res.json(adminConsole.setMaintenanceMode(req.body.enabled, req.body.message));
});

router.post('/admin/feature-flags', rbac('platform:manage'), (req, res) => {
    try { res.json(adminConsole.setFeatureFlag(req.body.flag, req.body.enabled)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/admin/announcements', rbac('platform:manage'), (req, res) => {
    res.status(201).json(adminConsole.addAnnouncement(req.body.message, req.body.severity));
});

router.get('/admin/system', rbac('platform:manage'), (req, res) => {
    res.json(adminConsole.getSystemState());
});

router.get('/admin/audit-log', rbac('platform:manage'), (req, res) => {
    res.json(adminConsole.getAuditLog(parseInt(req.query.limit) || 50));
});

router.get('/admin/stats', rbac('platform:manage'), async (req, res, next) => {
    try {
        const result = await adminConsole.getStats();
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// ── Team settings for standard multi-tenant users ──

router.get('/team/members', rbac(), async (req, res, next) => {
    try {
        const members = await prisma.user.findMany({
            where: { tenantId: req.tenantId }
        });
        res.json({ members });
    } catch (err) {
        next(err);
    }
});

router.post('/team/members', rbac(), async (req, res, next) => {
    try {
        const { email, role } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Check if user already exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            // Update tenant relationship
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    tenantId: req.tenantId,
                    tenantRole: role || 'developer',
                }
            });
        } else {
            // Create a placeholder member user
            user = await prisma.user.create({
                data: {
                    email,
                    role: 'user',
                    tenantId: req.tenantId,
                    tenantRole: role || 'developer',
                }
            });
        }
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});

router.delete('/team/members/:userId', rbac(), async (req, res, next) => {
    try {
        const { userId } = req.params;
        // Verify user belongs to the caller's tenant first to prevent unauthorized deletions
        const user = await prisma.user.findFirst({
            where: { id: userId, tenantId: req.tenantId }
        });
        if (!user) return res.status(404).json({ error: 'Member not found in this team' });

        if (user.tenantRole === 'owner') {
            return res.status(400).json({ error: 'Cannot remove the owner of the workspace' });
        }

        // Dissociate from tenant by deleting the user record
        await prisma.user.delete({ where: { id: userId } });
        res.json({ success: true, message: 'Member removed from team' });
    } catch (err) {
        next(err);
    }
});

router.put('/team/name', rbac(), async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Team name is required' });

        const tenant = await prisma.tenant.update({
            where: { id: req.tenantId },
            data: { name }
        });
        res.json({ success: true, tenant });
    } catch (err) {
        next(err);
    }
});

// ═══════════════════════════════════════════════
// Health Check & Readiness Probes (Phase 54)
// ═══════════════════════════════════════════════

router.get('/health', (req, res) => {
    res.json(healthCheck.healthz());
});

router.get('/ready', (req, res) => {
    const result = healthCheck.readyz();
    res.status(result.ready ? 200 : 503).json(result);
});

router.get('/live', (req, res) => {
    const result = healthCheck.livez();
    const status = result.status === 'UNHEALTHY' ? 503 : 200;
    res.status(status).json(result);
});

router.get('/startup', (req, res) => {
    res.json(healthCheck.startupz());
});

router.get('/health/dependencies', rbac('audit:read'), (req, res) => {
    res.json(healthCheck.getDependencyMatrix());
});

router.post('/health/dependencies/:name', rbac('tenants:configure'), (req, res) => {
    res.json(healthCheck.setDependencyStatus(req.params.name, req.body.status, req.body.latency));
});

router.get('/health/history', rbac('audit:read'), (req, res) => {
    res.json(healthCheck.getHistory(parseInt(req.query.limit) || 20));
});

router.get('/health/stats', rbac('audit:read'), (req, res) => {
    res.json(healthCheck.getStats());
});

// ═══════════════════════════════════════════════
// OpenAPI / Swagger (Phase 55)
// ═══════════════════════════════════════════════

router.get('/api-docs/spec', rbac('audit:read'), (req, res) => {
    if (!openAPIGenerator.getSpec()) openAPIGenerator.autoRegisterEnterprise();
    res.json(openAPIGenerator.generateSpec());
});

router.get('/api-docs/tags', rbac('audit:read'), (req, res) => {
    res.json(openAPIGenerator.listTags());
});

router.get('/api-docs/stats', rbac('audit:read'), (req, res) => {
    res.json(openAPIGenerator.getStats());
});

// ═══════════════════════════════════════════════
// Stress Test Engine (Phase 56)
// ═══════════════════════════════════════════════

router.post('/stress/run/:suite', rbac('tenants:configure'), async (req, res) => {
    try {
        const result = await stressTestEngine.runSuite(req.params.suite);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/stress/results', rbac('audit:read'), (req, res) => {
    res.json(stressTestEngine.getResults(req.query.suite));
});

router.get('/stress/stats', rbac('audit:read'), (req, res) => {
    res.json(stressTestEngine.getStats());
});

// ═══════════════════════════════════════════════
// Cost Analytics Dashboard (Phase 57)
// ═══════════════════════════════════════════════

router.post('/costs/record', rbac('agents:dispatch'), (req, res) => {
    res.status(201).json(costAnalytics.recordCost(req.body));
});

router.post('/costs/budget', rbac('tenants:configure'), (req, res) => {
    res.json(costAnalytics.setBudget(req.body.tenantId, req.body));
});

router.get('/costs/budget/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(costAnalytics.getBudgetStatus(req.params.tenantId));
});

router.get('/costs/tenant/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(costAnalytics.getByTenant(req.params.tenantId, req.query));
});

router.get('/costs/agent/:agentName', rbac('audit:read'), (req, res) => {
    res.json(costAnalytics.getByAgent(req.params.agentName));
});

router.get('/costs/trends', rbac('audit:read'), (req, res) => {
    res.json(costAnalytics.getTrends(req.query.tenantId, req.query.period));
});

router.get('/costs/roi/:agentName', rbac('audit:read'), (req, res) => {
    res.json(costAnalytics.calculateROI(req.params.agentName, parseFloat(req.query.revenue) || 0));
});

router.get('/costs/alerts', rbac('audit:read'), (req, res) => {
    res.json(costAnalytics.getAlerts(req.query.tenantId));
});

router.get('/costs/stats', rbac('audit:read'), (req, res) => {
    res.json(costAnalytics.getStats());
});

// ═══════════════════════════════════════════════
// Agent Performance Benchmarking (Phase 58)
// ═══════════════════════════════════════════════

router.post('/benchmarks/record', rbac('agents:dispatch'), (req, res) => {
    res.status(201).json(perfBenchmark.record(req.body.agentName, req.body));
});

router.post('/benchmarks/sla', rbac('tenants:configure'), (req, res) => {
    try {
        res.json(perfBenchmark.setSLA(req.body.agentName, req.body.tier));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/benchmarks/latency/:agentName', rbac('audit:read'), (req, res) => {
    const data = perfBenchmark.getLatencyPercentiles(req.params.agentName);
    if (!data) return res.status(404).json({ error: 'No data' });
    res.json(data);
});

router.get('/benchmarks/efficiency/:agentName', rbac('audit:read'), (req, res) => {
    const data = perfBenchmark.getTokenEfficiency(req.params.agentName);
    if (!data) return res.status(404).json({ error: 'No data' });
    res.json(data);
});

router.get('/benchmarks/sla/:agentName', rbac('audit:read'), (req, res) => {
    const data = perfBenchmark.getSLACompliance(req.params.agentName);
    if (!data) return res.status(404).json({ error: 'No data' });
    res.json(data);
});

router.get('/benchmarks/compare', rbac('audit:read'), (req, res) => {
    const agents = (req.query.agents || '').split(',').filter(Boolean);
    res.json(perfBenchmark.compareAgents(agents));
});

router.get('/benchmarks/agents', rbac('audit:read'), (req, res) => {
    res.json(perfBenchmark.listAgents());
});

router.get('/benchmarks/stats', rbac('audit:read'), (req, res) => {
    res.json(perfBenchmark.getStats());
});

// ═══════════════════════════════════════════════
// Token Metering & Billing (Phase 59)
// ═══════════════════════════════════════════════

router.post('/billing/accounts', rbac('tenants:configure'), (req, res) => {
    try {
        res.status(201).json(tokenBilling.createAccount(req.body.tenantId, req.body.plan));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/billing/consume', rbac('agents:dispatch'), (req, res) => {
    try {
        res.json(tokenBilling.consumeTokens(req.body.tenantId, req.body));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/billing/prepaid', rbac('tenants:configure'), (req, res) => {
    try {
        res.json(tokenBilling.addPrepaidTokens(req.body.tenantId, req.body.amount, req.body.tokens));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/billing/estimate', rbac('audit:read'), (req, res) => {
    res.json(tokenBilling.estimateCost(
        req.query.tenantId,
        parseInt(req.query.inputTokens) || 0,
        parseInt(req.query.outputTokens) || 0,
        req.query.model,
    ));
});

router.get('/billing/usage/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(tokenBilling.getUsageReport(req.params.tenantId, req.query.period));
});

router.get('/billing/invoice/:tenantId', rbac('audit:read'), (req, res) => {
    try {
        res.json(tokenBilling.generateInvoice(req.params.tenantId));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/billing/accounts', rbac('audit:read'), (req, res) => {
    res.json(tokenBilling.listAccounts());
});

router.get('/billing/account/:tenantId', rbac('audit:read'), (req, res) => {
    const account = tokenBilling.getAccount(req.params.tenantId);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
});

router.get('/billing/plans', (req, res) => {
    res.json(tokenBilling.listPlans());
});

router.get('/billing/models', (req, res) => {
    res.json(tokenBilling.listModels());
});

router.get('/billing/invoices/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(tokenBilling.getInvoices(req.params.tenantId));
});

router.get('/billing/stats', rbac('audit:read'), (req, res) => {
    res.json(tokenBilling.getStats());
});

// ═══════════════════════════════════════════════
// Phase 60: Webhook Management
// ═══════════════════════════════════════════════

router.post('/webhooks/register', rbac('admin:write'), (req, res) => {
    res.status(201).json(webhookManager.register(req.body));
});

router.put('/webhooks/:id', rbac('admin:write'), (req, res) => {
    res.json(webhookManager.update(req.params.id, req.body));
});

router.delete('/webhooks/:id', rbac('admin:write'), (req, res) => {
    res.json(webhookManager.delete(req.params.id));
});

router.post('/webhooks/dispatch', rbac('admin:write'), (req, res) => {
    webhookManager.dispatch(req.body.event, req.body.payload, req.body.tenantId)
        .then(result => res.json(result));
});

router.get('/webhooks/list/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(webhookManager.list(req.params.tenantId));
});

router.get('/webhooks/:id/deliveries', rbac('audit:read'), (req, res) => {
    res.json(webhookManager.getDeliveries(req.params.id));
});

router.post('/webhooks/:id/reset-circuit', rbac('admin:write'), (req, res) => {
    res.json(webhookManager.resetCircuit(req.params.id));
});

router.get('/webhooks/events', (req, res) => {
    res.json(webhookManager.getEvents());
});

router.get('/webhooks/stats', rbac('audit:read'), (req, res) => {
    res.json(webhookManager.getStats());
});

// ═══════════════════════════════════════════════
// Phase 61: Data Export & Import
// ═══════════════════════════════════════════════

router.post('/data/export', rbac('admin:write'), (req, res) => {
    res.json(dataExportImport.exportData(req.body));
});

router.post('/data/import', rbac('admin:write'), (req, res) => {
    res.json(dataExportImport.importData(req.body));
});

router.post('/data/schedule-export', rbac('admin:write'), (req, res) => {
    res.json(dataExportImport.scheduleExport(req.body));
});

router.get('/data/schedules/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(dataExportImport.listSchedules(req.params.tenantId));
});

router.get('/data/jobs/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(dataExportImport.listJobs(req.params.tenantId, req.query.type));
});

router.get('/data/stats', rbac('audit:read'), (req, res) => {
    res.json(dataExportImport.getStats());
});

// ═══════════════════════════════════════════════
// Phase 62: Dashboard Builder
// ═══════════════════════════════════════════════

router.post('/dashboards', rbac('admin:write'), (req, res) => {
    res.status(201).json(dashboardBuilder.createDashboard(req.body));
});

router.put('/dashboards/:id', rbac('admin:write'), (req, res) => {
    res.json(dashboardBuilder.updateDashboard(req.params.id, req.body));
});

router.delete('/dashboards/:id', rbac('admin:write'), (req, res) => {
    res.json(dashboardBuilder.deleteDashboard(req.params.id));
});

router.post('/dashboards/:id/widgets', rbac('admin:write'), (req, res) => {
    res.status(201).json(dashboardBuilder.addWidget(req.params.id, req.body.type, req.body));
});

router.delete('/dashboards/:dashId/widgets/:widgetId', rbac('admin:write'), (req, res) => {
    res.json(dashboardBuilder.removeWidget(req.params.dashId, req.params.widgetId));
});

router.put('/dashboards/widgets/:id/config', rbac('admin:write'), (req, res) => {
    res.json(dashboardBuilder.configureWidget(req.params.id, req.body));
});

router.post('/dashboards/:id/share', rbac('admin:write'), (req, res) => {
    res.json(dashboardBuilder.shareDashboard(req.params.id));
});

router.post('/dashboards/:id/clone', rbac('admin:write'), (req, res) => {
    res.json(dashboardBuilder.cloneDashboard(req.params.id, req.body.name, req.body.userId));
});

router.get('/dashboards/list/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(dashboardBuilder.listDashboards(req.params.tenantId, req.query.userId));
});

router.get('/dashboards/templates', (req, res) => {
    res.json(dashboardBuilder.getTemplates());
});

router.get('/dashboards/widget-types', (req, res) => {
    res.json(dashboardBuilder.getWidgetTypes());
});

router.get('/dashboards/stats', rbac('audit:read'), (req, res) => {
    res.json(dashboardBuilder.getStats());
});

// ═══════════════════════════════════════════════
// Phase 63: Agent Collaboration Protocol
// ═══════════════════════════════════════════════

router.post('/collaboration/sessions', rbac('admin:write'), (req, res) => {
    res.status(201).json(agentCollaboration.createSession(req.body));
});

router.post('/collaboration/:id/message', rbac('admin:write'), (req, res) => {
    res.json(agentCollaboration.sendMessage(req.params.id, req.body.from, req.body.to, req.body.payload, req.body.priority));
});

router.get('/collaboration/:id/messages', rbac('audit:read'), (req, res) => {
    res.json(agentCollaboration.getMessages(req.params.id, req.query.agent));
});

router.post('/collaboration/:id/state', rbac('admin:write'), (req, res) => {
    res.json(agentCollaboration.setSharedState(req.params.id, req.body.key, req.body.value, req.body.agent));
});

router.get('/collaboration/:id/state', rbac('audit:read'), (req, res) => {
    res.json(agentCollaboration.getSharedState(req.params.id, req.query.key));
});

router.post('/collaboration/:id/execute', rbac('admin:write'), (req, res) => {
    agentCollaboration.executePattern(req.params.id, req.body.input)
        .then(result => res.json(result));
});

router.post('/collaboration/:id/end', rbac('admin:write'), (req, res) => {
    res.json(agentCollaboration.endSession(req.params.id));
});

router.post('/collaboration/channels', rbac('admin:write'), (req, res) => {
    res.status(201).json(agentCollaboration.createChannel(req.body.name, req.body.type));
});

router.post('/collaboration/channels/:id/subscribe', rbac('admin:write'), (req, res) => {
    res.json(agentCollaboration.subscribe(req.params.id, req.body.agent));
});

router.get('/collaboration/patterns', (req, res) => {
    res.json(agentCollaboration.getPatterns());
});

router.get('/collaboration/stats', rbac('audit:read'), (req, res) => {
    res.json(agentCollaboration.getStats());
});

// ═══════════════════════════════════════════════
// Phase 64: Tenant Migration
// ═══════════════════════════════════════════════

router.post('/migration/plan', rbac('admin:write'), (req, res) => {
    res.status(201).json(tenantMigration.planMigration(req.body));
});

router.post('/migration/:id/execute', rbac('admin:write'), (req, res) => {
    tenantMigration.executeMigration(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/migration/:id/rollback', rbac('admin:write'), (req, res) => {
    res.json(tenantMigration.rollback(req.params.id));
});

router.post('/migration/:id/pause', rbac('admin:write'), (req, res) => {
    res.json(tenantMigration.pauseMigration(req.params.id));
});

router.post('/migration/:id/resume', rbac('admin:write'), (req, res) => {
    res.json(tenantMigration.resumeMigration(req.params.id));
});

router.get('/migration/:id', rbac('audit:read'), (req, res) => {
    const m = tenantMigration.getMigration(req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json(m);
});

router.get('/migration/:id/progress', rbac('audit:read'), (req, res) => {
    res.json(tenantMigration.getProgress(req.params.id));
});

router.get('/migration/:id/audit', rbac('audit:read'), (req, res) => {
    res.json(tenantMigration.getAuditTrail(req.params.id));
});

router.get('/migration/list/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(tenantMigration.listMigrations(req.params.tenantId));
});

router.get('/migration/regions', (req, res) => {
    res.json(tenantMigration.getRegions());
});

router.get('/migration/stats', rbac('audit:read'), (req, res) => {
    res.json(tenantMigration.getStats());
});

// ═══════════════════════════════════════════════
// Phase 65: Compliance Certification
// ═══════════════════════════════════════════════

router.post('/certifications/assess', rbac('admin:write'), (req, res) => {
    res.status(201).json(complianceCertification.startAssessment(req.body.tenantId, req.body.framework));
});

router.post('/certifications/:id/control', rbac('admin:write'), (req, res) => {
    res.json(complianceCertification.assessControl(req.params.id, req.body.controlId, req.body.status, req.body.evidence, req.body.notes));
});

router.post('/certifications/:id/auto-collect', rbac('admin:write'), (req, res) => {
    res.json(complianceCertification.autoCollectEvidence(req.params.id));
});

router.post('/certifications/:id/complete', rbac('admin:write'), (req, res) => {
    res.json(complianceCertification.completeAssessment(req.params.id));
});

router.post('/certifications/:id/issue', rbac('admin:write'), (req, res) => {
    try {
        res.json(complianceCertification.issueCertification(req.params.id));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/certifications/cross-walk', rbac('audit:read'), (req, res) => {
    res.json(complianceCertification.crossWalk(req.query.fw1, req.query.fw2));
});

router.get('/certifications/:id/remediations', rbac('audit:read'), (req, res) => {
    res.json(complianceCertification.getRemediations(req.params.id));
});

router.put('/certifications/remediations/:id/assign', rbac('admin:write'), (req, res) => {
    res.json(complianceCertification.assignRemediation(req.params.id, req.body.owner, req.body.dueDate));
});

router.put('/certifications/remediations/:id/complete', rbac('admin:write'), (req, res) => {
    res.json(complianceCertification.completeRemediation(req.params.id));
});

router.get('/certifications/list/:tenantId', rbac('audit:read'), (req, res) => {
    res.json(complianceCertification.listCertifications(req.params.tenantId));
});

router.get('/certifications/frameworks', (req, res) => {
    res.json(complianceCertification.getFrameworks());
});

router.get('/certifications/stats', rbac('audit:read'), (req, res) => {
    res.json(complianceCertification.getStats());
});

export default router;
