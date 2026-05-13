/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * ENTERPRISE PHASES 42-44 TEST SUITE
 * Audit Export + WebSocket Feed + Secret Rotation
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
// Phase 42: Audit Log Export
// ═══════════════════════════════════════════════

describe('Phase 42: Audit Log Export', () => {
    it('should append audit entries with HMAC chain', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const entry = auditExporter.append({
            action: 'AGENT_DISPATCHED',
            actor: 'admin@jpmorgan.com',
            tenantId: 'jpmorgan',
            agentName: 'codeReview',
            severity: 'INFO',
            details: { task: 'Review auth module' },
        });

        expect(entry.id).toMatch(/^audit_/);
        expect(entry.hash).toBeDefined();
        expect(entry.hash.length).toBe(16);
    });

    it('should maintain tamper-proof hash chain', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        auditExporter.append({ action: 'LOGIN', actor: 'user1', severity: 'INFO' });
        auditExporter.append({ action: 'DISPATCH', actor: 'user1', severity: 'INFO' });
        auditExporter.append({ action: 'LOGOUT', actor: 'user1', severity: 'INFO' });

        const integrity = auditExporter.verifyIntegrity();
        expect(integrity.valid).toBe(true);
        expect(integrity.recordsChecked).toBeGreaterThanOrEqual(3);
    });

    it('should query logs with filters', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const results = auditExporter.query({ tenantId: 'jpmorgan' });
        expect(results.total).toBeGreaterThanOrEqual(1);
        expect(results.results[0].tenantId).toBe('jpmorgan');
    });

    it('should export as CSV', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const csv = auditExporter.exportCSV({});
        expect(csv).toContain('id,timestamp,severity');
        expect(csv.split('\n').length).toBeGreaterThan(1);
    });

    it('should export as NDJSON', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const ndjson = auditExporter.exportNDJSON({});
        const lines = ndjson.split('\n').filter(Boolean);
        expect(lines.length).toBeGreaterThan(0);
        expect(() => JSON.parse(lines[0])).not.toThrow();
    });

    it('should export in CEF format (SIEM)', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const cef = auditExporter.exportCEF({});
        expect(cef).toContain('CEF:0|AltiCodeStudio');
    });

    it('should export for Splunk HEC', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const splunk = auditExporter.exportSplunkHEC({});
        const parsed = JSON.parse(splunk.split('\n')[0]);
        expect(parsed.source).toBe('enterprise-audit');
        expect(parsed.index).toBe('enterprise_audit');
    });

    it('should export for Datadog', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const dd = auditExporter.exportDatadog({});
        const parsed = JSON.parse(dd.split('\n')[0]);
        expect(parsed.ddsource).toBe('alti-code-studio');
        expect(parsed.service).toBe('enterprise-audit');
    });

    it('should export for Elastic bulk', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const elastic = auditExporter.exportElastic({});
        const lines = elastic.split('\n');
        // Every 2 lines: index action + document
        const indexLine = JSON.parse(lines[0]);
        expect(indexLine.index._index).toMatch(/^audit-/);
    });

    it('should register SIEM sinks', async () => {
        const { auditExporter } = await import('./audit.exporter.js');

        const sink = auditExporter.registerSink('splunk-prod', {
            type: 'splunk',
            endpoint: 'https://splunk.example.com:8088',
            token: 'abc123',
        });

        expect(sink.type).toBe('splunk');
        const sinks = auditExporter.listSinks();
        expect(sinks[0].token).toBe('***redacted***');
    });

    it('should support 6 retention policies', async () => {
        const { RETENTION_POLICIES } = await import('./audit.exporter.js');
        expect(RETENTION_POLICIES.sox.days).toBe(2555);     // 7 years
        expect(RETENTION_POLICIES.hipaa.days).toBe(2190);   // 6 years
        expect(RETENTION_POLICIES.gdpr.days).toBe(1095);    // 3 years
        expect(RETENTION_POLICIES['pci-dss'].days).toBe(365);
    });
});

// ═══════════════════════════════════════════════
// Phase 43: WebSocket Real-Time Feed
// ═══════════════════════════════════════════════

describe('Phase 43: WebSocket Real-Time Feed', () => {
    it('should establish authenticated connections', async () => {
        const { wsFeed } = await import('./websocket.feed.js');

        const conn = wsFeed.addConnection({
            tenantId: 'jpmorgan',
            userId: 'admin@jpmorgan.com',
            role: 'tenant_admin',
        });

        expect(conn.connectionId).toMatch(/^ws_/);
        expect(conn.channels).toBeDefined();
    });

    it('should subscribe to channels with role check', async () => {
        const { wsFeed } = await import('./websocket.feed.js');

        const conn = wsFeed.addConnection({ tenantId: 'test', role: 'tenant_admin' });
        const sub = wsFeed.subscribe(conn.connectionId, 'dispatches');

        expect(sub.subscribed).toBe(true);
        expect(sub.channel).toBe('dispatches');
    });

    it('should deny access to insufficient roles', async () => {
        const { wsFeed } = await import('./websocket.feed.js');

        const conn = wsFeed.addConnection({ tenantId: 'test', role: 'viewer' });
        expect(() => wsFeed.subscribe(conn.connectionId, 'security')).toThrow('Insufficient permissions');
    });

    it('should broadcast to channel subscribers', async () => {
        const { wsFeed } = await import('./websocket.feed.js');

        // Two connections, both on 'system'
        const c1 = wsFeed.addConnection({ tenantId: 'a', role: 'operator' });
        const c2 = wsFeed.addConnection({ tenantId: 'b', role: 'operator' });
        wsFeed.subscribe(c1.connectionId, 'system');
        wsFeed.subscribe(c2.connectionId, 'system');

        const result = wsFeed.broadcast('system', {
            type: 'system.health_check',
            data: { status: 'healthy' },
        });

        expect(result.delivered).toBeGreaterThanOrEqual(2);
        expect(result.messageId).toMatch(/^msg_/);
    });

    it('should map enterprise events to channels', async () => {
        const { wsFeed } = await import('./websocket.feed.js');

        const conn = wsFeed.addConnection({ tenantId: 'pubsub', role: 'compliance_officer' });
        wsFeed.subscribe(conn.connectionId, 'compliance');

        const result = wsFeed.publishEvent({
            type: 'compliance.violation',
            data: { framework: 'GDPR', severity: 'HIGH' },
        });

        expect(result.delivered).toBeGreaterThanOrEqual(1);
    });

    it('should handle heartbeat and prune stale connections', async () => {
        const { wsFeed } = await import('./websocket.feed.js');

        const conn = wsFeed.addConnection({ tenantId: 'heartbeat' });
        const heartbeatResult = wsFeed.heartbeat(conn.connectionId);
        expect(heartbeatResult).toBe(true);

        const pruneResult = wsFeed.pruneStaleConnections();
        expect(pruneResult.pruned).toBeGreaterThanOrEqual(0);
    });

    it('should disconnect and clean up subscriptions', async () => {
        const { wsFeed } = await import('./websocket.feed.js');

        const conn = wsFeed.addConnection({ tenantId: 'dc-test', role: 'operator' });
        wsFeed.subscribe(conn.connectionId, 'system');
        wsFeed.removeConnection(conn.connectionId);

        const conns = wsFeed.getConnections('dc-test');
        expect(conns.filter(c => c.id === conn.connectionId).length).toBe(0);
    });

    it('should have 8 channels', async () => {
        const { CHANNELS } = await import('./websocket.feed.js');
        expect(Object.keys(CHANNELS).length).toBe(8);
        expect(CHANNELS.system).toBeDefined();
        expect(CHANNELS.compliance).toBeDefined();
        expect(CHANNELS.security).toBeDefined();
    });

    it('should replay recent messages', async () => {
        const { wsFeed } = await import('./websocket.feed.js');
        const messages = wsFeed.getRecentMessages(null, 10);
        expect(Array.isArray(messages)).toBe(true);
    });

    it('should report stats', async () => {
        const { wsFeed } = await import('./websocket.feed.js');
        const stats = wsFeed.getStats();

        expect(stats.activeConnections).toBeGreaterThanOrEqual(0);
        expect(stats.channels).toBe(8);
        expect(stats.totalBroadcasts).toBeGreaterThanOrEqual(0);
    });
});

// ═══════════════════════════════════════════════
// Phase 44: Secret Rotation Automation
// ═══════════════════════════════════════════════

describe('Phase 44: Secret Rotation Automation', () => {
    it('should create secrets with AES-256-GCM encryption', async () => {
        const { secretManager } = await import('./secret.rotation.js');

        const result = await secretManager.createSecret({
            name: 'gemini-api-key',
            type: 'api_key',
            tenantId: 'jpmorgan',
            value: 'AIzaSyB0000000000000000',
        });

        expect(result.secretId).toMatch(/^secret_/);
        expect(result.version).toBe(1);
        expect(result.nextRotation).toBeDefined();
    });

    it('should support 8 secret types', async () => {
        const { SECRET_TYPES } = await import('./secret.rotation.js');

        expect(Object.keys(SECRET_TYPES).length).toBe(8);
        expect(SECRET_TYPES.api_key).toBeDefined();
        expect(SECRET_TYPES.tls_cert).toBeDefined();
        expect(SECRET_TYPES.encryption).toBeDefined();
    });

    it('should rotate secrets with versioning and overlap', async () => {
        const { secretManager } = await import('./secret.rotation.js');

        const secret = await secretManager.createSecret({
            name: 'db-password',
            type: 'db_password',
        });

        const rotation = await secretManager.rotateSecret(secret.secretId, {
            overlapMs: 7200000, // 2 hours
        });

        expect(rotation.newVersion).toBe(2);
        expect(rotation.previousVersion).toBe(1);
        expect(rotation.overlapMs).toBe(7200000);
    });

    it('should maintain version history', async () => {
        const { secretManager } = await import('./secret.rotation.js');

        const secret = await secretManager.createSecret({ name: 'test-history', type: 'webhook' });
        await secretManager.rotateSecret(secret.secretId);
        await secretManager.rotateSecret(secret.secretId);

        const versions = secretManager.getVersionHistory(secret.secretId);
        expect(versions.length).toBe(3); // v1, v2, v3
        expect(versions[2].version).toBe(3);
        expect(versions[2].status).toBe('CURRENT');
    });

    it('should rollback to previous versions', async () => {
        const { secretManager } = await import('./secret.rotation.js');

        const secret = await secretManager.createSecret({ name: 'rollback-test', type: 'signing_key' });
        await secretManager.rotateSecret(secret.secretId);
        await secretManager.rotateSecret(secret.secretId);

        const result = secretManager.rollbackSecret(secret.secretId, 1);
        expect(result.rolledBackTo).toBe(1);

        const versions = secretManager.getVersionHistory(secret.secretId);
        const current = versions.find(v => v.status === 'CURRENT');
        expect(current.version).toBe(1);
    });

    it('should set rotation schedules', async () => {
        const { secretManager, ROTATION_SCHEDULES } = await import('./secret.rotation.js');

        const secret = await secretManager.createSecret({ name: 'scheduled', type: 'oauth_token' });
        const schedule = secretManager.setRotationSchedule(secret.secretId, 'monthly');

        expect(schedule.label).toBe('Monthly (30d)');
        expect(schedule.enabled).toBe(true);
        expect(Object.keys(ROTATION_SCHEDULES).length).toBe(6);
    });

    it('should check for expiring secrets', async () => {
        const { secretManager } = await import('./secret.rotation.js');
        const result = secretManager.checkExpiring(365);
        expect(result).toBeDefined();
        expect(typeof result.total).toBe('number');
    });

    it('should generate NIST 800-53 / PCI-DSS compliance report', async () => {
        const { secretManager } = await import('./secret.rotation.js');
        const report = secretManager.getComplianceReport();

        expect(report.nist80053).toBeDefined();
        expect(report.nist80053.sc28).toContain('AES-256-GCM');
        expect(report.pciDss).toBeDefined();
        expect(report.complianceScore).toBeDefined();
    });

    it('should encrypt/decrypt with envelope encryption', async () => {
        const { secretManager } = await import('./secret.rotation.js');

        const plaintext = 'super-secret-api-key-12345';
        const encrypted = await secretManager._encrypt(plaintext);

        expect(encrypted.algorithm).toBe('aes-256-gcm');
        expect(encrypted.iv).toBeDefined();
        expect(encrypted.tag).toBeDefined();

        const decrypted = await secretManager._decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
    });

    it('should list secrets per tenant (redacted)', async () => {
        const { secretManager } = await import('./secret.rotation.js');

        const secrets = secretManager.listSecrets('jpmorgan');
        expect(secrets.length).toBeGreaterThanOrEqual(1);
        // Should not expose encrypted values
        expect(secrets[0].encryptedValue).toBeUndefined();
    });
});

// ═══════════════════════════════════════════════
// Cross-Module Integration
// ═══════════════════════════════════════════════

describe('Phases 42-44 Cross Integration', () => {
    it('should export all modules from barrel index', async () => {
        const enterprise = await import('./index.js');

        // Phase 42
        expect(enterprise.auditExporter).toBeDefined();
        expect(enterprise.SEVERITY).toBeDefined();
        expect(enterprise.RETENTION_POLICIES).toBeDefined();

        // Phase 43
        expect(enterprise.wsFeed).toBeDefined();
        expect(enterprise.CHANNELS).toBeDefined();

        // Phase 44
        expect(enterprise.secretManager).toBeDefined();
        expect(enterprise.SECRET_TYPES).toBeDefined();
        expect(enterprise.ROTATION_SCHEDULES).toBeDefined();
    });

    it('should log audit event → broadcast via WebSocket', async () => {
        const { auditExporter, wsFeed } = await import('./index.js');

        // Append audit entry
        const entry = auditExporter.append({
            action: 'SECRET_ROTATED',
            actor: 'automated',
            tenantId: 'goldman-sachs',
            severity: 'NOTICE',
        });

        // Broadcast rotation event via WebSocket
        const conn = wsFeed.addConnection({ tenantId: 'goldman-sachs', role: 'security_admin' });
        wsFeed.subscribe(conn.connectionId, 'security');

        const bcast = wsFeed.publishEvent({
            type: 'security.key_rotated',
            data: { auditId: entry.id, action: entry.action },
        });

        expect(bcast.delivered).toBeGreaterThanOrEqual(1);
    });

    it('should audit secret rotation and export', async () => {
        const { auditExporter, secretManager } = await import('./index.js');

        // Create and rotate
        const secret = await secretManager.createSecret({ name: 'cross-test', type: 'api_key', tenantId: 'test' });
        await secretManager.rotateSecret(secret.secretId);

        // Log to audit
        auditExporter.append({
            action: 'SECRET_ROTATED',
            tenantId: 'test',
            details: { secretId: secret.secretId, newVersion: 2 },
        });

        // Verify in export
        const csv = auditExporter.exportCSV({ tenantId: 'test' });
        expect(csv).toContain('SECRET_ROTATED');
    });
});
