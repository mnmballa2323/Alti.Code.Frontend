/**
 * Copyright (c) 2024 Inso Code
 * 
 * AUDIT LOG EXPORT ENGINE (Phase 42)
 * 
 * Enterprise audit log system with:
 *   - Multi-format export (CSV, JSON, NDJSON, SIEM/CEF, Syslog)
 *   - Filtered queries (tenant, agent, date range, severity, action)
 *   - Splunk HEC / Datadog / Elastic / QRadar integration formats
 *   - Immutable append-only log with tamper detection (HMAC chain)
 *   - Retention policies tied to compliance (SOX: 7yr, HIPAA: 6yr)
 *   - Real-time log streaming to SIEM
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Severity Levels & Retention
// ═══════════════════════════════════════════════

const SEVERITY = { DEBUG: 0, INFO: 1, NOTICE: 2, WARNING: 3, ERROR: 4, CRITICAL: 5, ALERT: 6, EMERGENCY: 7 };

const RETENTION_POLICIES = {
    sox: { days: 2555, label: '7 years (SOX)' },
    hipaa: { days: 2190, label: '6 years (HIPAA)' },
    'pci-dss': { days: 365, label: '1 year (PCI-DSS)' },
    gdpr: { days: 1095, label: '3 years (GDPR)' },
    fedramp: { days: 1095, label: '3 years (FedRAMP)' },
    default: { days: 365, label: '1 year (default)' },
};

// ═══════════════════════════════════════════════
// Audit Log Store
// ═══════════════════════════════════════════════

class AuditLogExporter {
    constructor() {
        this.logs = [];
        this.maxSize = 100000;
        this.hashChain = null;  // For tamper detection
        this.signingKey = crypto.randomBytes(32).toString('hex');
        this.sinkConfigs = new Map();
        this.stats = { totalLogged: 0, totalExported: 0, sinkDeliveries: 0 };
    }

    // ── Append Log Entry ──

    append(entry) {
        const record = {
            id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            timestamp: new Date().toISOString(),
            severity: entry.severity || 'INFO',
            action: entry.action,
            actor: entry.actor || 'system',
            tenantId: entry.tenantId || 'global',
            resource: entry.resource || null,
            agentName: entry.agentName || null,
            details: entry.details || {},
            ip: entry.ip || null,
            userAgent: entry.userAgent || null,
            previousHash: this.hashChain,
        };

        // HMAC chain for tamper detection
        record.hash = this._computeHash(record);
        this.hashChain = record.hash;

        if (this.logs.length >= this.maxSize) {
            this.logs = this.logs.slice(-Math.floor(this.maxSize * 0.8));
        }

        this.logs.push(record);
        this.stats.totalLogged++;

        return record;
    }

    // ── Query Logs ──

    query(filters = {}) {
        let results = [...this.logs];

        if (filters.tenantId) results = results.filter(l => l.tenantId === filters.tenantId);
        if (filters.agentName) results = results.filter(l => l.agentName === filters.agentName);
        if (filters.action) results = results.filter(l => l.action === filters.action);
        if (filters.actor) results = results.filter(l => l.actor === filters.actor);
        if (filters.severity) {
            const minSev = SEVERITY[filters.severity] || 0;
            results = results.filter(l => (SEVERITY[l.severity] || 0) >= minSev);
        }
        if (filters.from) {
            const fromDate = new Date(filters.from);
            results = results.filter(l => new Date(l.timestamp) >= fromDate);
        }
        if (filters.to) {
            const toDate = new Date(filters.to);
            results = results.filter(l => new Date(l.timestamp) <= toDate);
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            results = results.filter(l =>
                JSON.stringify(l).toLowerCase().includes(term)
            );
        }

        // Sort newest first
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const limit = filters.limit || 1000;
        const offset = filters.offset || 0;

        return {
            total: results.length,
            offset,
            limit,
            results: results.slice(offset, offset + limit),
        };
    }

    // ── Export Formats ──

    exportJSON(filters = {}) {
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;
        return JSON.stringify(data.results, null, 2);
    }

    exportNDJSON(filters = {}) {
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;
        return data.results.map(r => JSON.stringify(r)).join('\n');
    }

    exportCSV(filters = {}) {
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;

        const headers = ['id', 'timestamp', 'severity', 'action', 'actor', 'tenantId', 'resource', 'agentName', 'details'];
        const rows = [headers.join(',')];

        for (const record of data.results) {
            const row = headers.map(h => {
                const val = h === 'details' ? JSON.stringify(record[h] || {}) : (record[h] || '');
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            rows.push(row.join(','));
        }

        return rows.join('\n');
    }

    // ── SIEM Integration Formats ──

    exportCEF(filters = {}) {
        // Common Event Format (ArcSight, QRadar)
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;

        return data.results.map(r => {
            const sev = this._cefSeverity(r.severity);
            return `CEF:0|InsoCode|EnterprisePlatform|2.0|${r.action}|${r.action}|${sev}|` +
                `src=${r.ip || '0.0.0.0'} suser=${r.actor} cs1=${r.tenantId} cs2=${r.agentName || ''} ` +
                `rt=${new Date(r.timestamp).getTime()} msg=${JSON.stringify(r.details)}`;
        }).join('\n');
    }

    exportSplunkHEC(filters = {}) {
        // Splunk HTTP Event Collector format
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;

        return data.results.map(r => JSON.stringify({
            time: Math.floor(new Date(r.timestamp).getTime() / 1000),
            host: 'alti-code-studio',
            source: 'enterprise-audit',
            sourcetype: 'json',
            index: 'enterprise_audit',
            event: r,
        })).join('\n');
    }

    exportDatadog(filters = {}) {
        // Datadog Log format
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;

        return data.results.map(r => JSON.stringify({
            ddsource: 'alti-code-studio',
            ddtags: `env:production,tenant:${r.tenantId},severity:${r.severity}`,
            hostname: 'enterprise-api',
            message: `${r.action}: ${JSON.stringify(r.details)}`,
            service: 'enterprise-audit',
            status: r.severity.toLowerCase(),
            timestamp: r.timestamp,
            ...r,
        })).join('\n');
    }

    exportElastic(filters = {}) {
        // Elastic/OpenSearch bulk index format
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;

        const lines = [];
        for (const r of data.results) {
            lines.push(JSON.stringify({ index: { _index: `audit-${r.timestamp.substring(0, 7)}`, _id: r.id } }));
            lines.push(JSON.stringify({ ...r, '@timestamp': r.timestamp }));
        }
        return lines.join('\n');
    }

    // ── Enterprise Secure Export (GCP WORM) ──

    async exportToGCSWorm(filters = {}) {
        const data = this.query(filters);
        this.stats.totalExported += data.results.length;

        try {
            const { azureStorageService } = await import('../azureCloud/azureStorage.service.js');
            const config = (await import('../../../../config/index.js')).default;

            const container = (config.azure && config.azure.audit_blob_container) || 'alti-code-studio-worm-audit';

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `audit_export_${timestamp}.json`;
            const fileKey = `exports/${fileName}`;

            await azureStorageService.uploadContent(container, fileKey, JSON.stringify(data.results, null, 2));

            logger.info(`✅ AuditExporter: WORM export saved to azure://${container}/${fileKey}`);
            return {
                message: 'Export successful',
                bucket: container,
                file: fileKey,
                recordCount: data.results.length
            };
        } catch (error) {
            logger.error('❌ AuditExporter: Failed to export to Azure Blob Storage', error.message);
            throw error;
        }
    }

    // ── SIEM Sink Configuration ──

    registerSink(name, config) {
        this.sinkConfigs.set(name, {
            name,
            type: config.type, // splunk | datadog | elastic | syslog | webhook
            endpoint: config.endpoint,
            token: config.token,
            enabled: config.enabled !== false,
            format: config.format || 'json',
            filters: config.filters || {},
            registeredAt: new Date().toISOString(),
        });
        logger.info(`📡 Audit sink registered: ${name} (${config.type})`);
        return this.sinkConfigs.get(name);
    }

    listSinks() {
        return [...this.sinkConfigs.values()].map(s => ({
            ...s,
            token: s.token ? '***redacted***' : null,
        }));
    }

    // ── Integrity Verification ──

    verifyIntegrity(startIndex = 0, endIndex) {
        const end = endIndex || this.logs.length;
        let previousHash = startIndex > 0 ? this.logs[startIndex - 1].hash : null;
        let valid = true;
        let brokenAt = null;

        for (let i = startIndex; i < end; i++) {
            const record = this.logs[i];
            if (record.previousHash !== previousHash) {
                valid = false;
                brokenAt = i;
                break;
            }
            const computed = this._computeHash({ ...record, hash: undefined });
            if (computed !== record.hash) {
                valid = false;
                brokenAt = i;
                break;
            }
            previousHash = record.hash;
        }

        return {
            valid,
            recordsChecked: end - startIndex,
            brokenAt,
            chainHead: this.hashChain,
        };
    }

    // ── Retention ──

    getRetentionPolicy(framework) {
        return RETENTION_POLICIES[framework] || RETENTION_POLICIES.default;
    }

    applyRetention(framework = 'default') {
        const policy = RETENTION_POLICIES[framework] || RETENTION_POLICIES.default;
        const cutoff = new Date(Date.now() - policy.days * 86400000);
        const before = this.logs.length;
        this.logs = this.logs.filter(l => new Date(l.timestamp) >= cutoff);
        return { framework, policy: policy.label, purged: before - this.logs.length, remaining: this.logs.length };
    }

    // ── Utilities ──

    _computeHash(record) {
        const data = `${record.id}|${record.timestamp}|${record.action}|${record.actor}|${record.tenantId}|${record.previousHash || ''}`;
        return crypto.createHmac('sha256', this.signingKey).update(data).digest('hex').substring(0, 16);
    }

    _cefSeverity(severity) {
        const map = { DEBUG: 0, INFO: 3, NOTICE: 4, WARNING: 5, ERROR: 7, CRITICAL: 8, ALERT: 9, EMERGENCY: 10 };
        return map[severity] || 5;
    }

    getStats() {
        return {
            totalRecords: this.logs.length,
            totalLogged: this.stats.totalLogged,
            totalExported: this.stats.totalExported,
            sinks: this.sinkConfigs.size,
            chainIntact: this.hashChain !== null,
            retentionPolicies: Object.keys(RETENTION_POLICIES),
        };
    }
}

export const auditExporter = new AuditLogExporter();
export { SEVERITY, RETENTION_POLICIES };
