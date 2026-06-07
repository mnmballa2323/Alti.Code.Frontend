/**
 * Copyright (c) 2024 Inso Code
 * 
 * OBSERVABILITY PIPELINE
 * 
 * Cloud Monitoring metrics export, distributed tracing,
 * agent performance dashboard, and real-time system metrics.
 * 
 * Designed for Google Cloud Operations (formerly Stackdriver):
 *   - Custom metrics → Cloud Monitoring
 *   - Trace spans → Cloud Trace
 *   - Structured logs → Cloud Logging
 */

import { logger } from '../../../shared/logger.js';
import monitoring from '@google-cloud/monitoring';

const metricClient = new monitoring.MetricServiceClient();
const PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

// ═══════════════════════════════════════════════
// Metric Collector (exportable to Cloud Monitoring)
// ═══════════════════════════════════════════════

class MetricCollector {
    constructor() {
        this.counters = new Map();
        this.gauges = new Map();
        this.histograms = new Map();
        this.histograms = new Map();
        this.startTime = Date.now();

        // 10s buffer to prevent GCP API rate limiting
        this.cloudBuffer = [];
        this.cloudFlushInterval = setInterval(() => this._flushCloudMetrics(), 10000);

        // Pre-register enterprise metrics
        this._defineMetrics();
    }

    _defineMetrics() {
        // Agent dispatch metrics
        this.defineCounter('agent.dispatch.total', 'Total agent dispatches');
        this.defineCounter('agent.dispatch.success', 'Successful agent dispatches');
        this.defineCounter('agent.dispatch.failure', 'Failed agent dispatches');
        this.defineCounter('agent.dispatch.timeout', 'Timed-out agent dispatches');

        // Token consumption
        this.defineCounter('tokens.consumed.total', 'Total tokens consumed across all agents');
        this.defineCounter('tokens.consumed.input', 'Input tokens consumed');
        this.defineCounter('tokens.consumed.output', 'Output tokens consumed');

        // Cost tracking
        this.defineCounter('cost.usd.total', 'Total estimated cost in USD');

        // Provider metrics
        this.defineCounter('provider.gemini.calls', 'Gemini API calls');
        this.defineCounter('provider.gpt4o.calls', 'GPT-4o API calls');
        this.defineCounter('provider.claude.calls', 'Claude API calls');
        this.defineCounter('provider.ollama.calls', 'Ollama API calls');
        this.defineCounter('provider.failover.count', 'Provider failover count');

        // Circuit breaker
        this.defineGauge('circuit.gemini.state', 'Gemini circuit breaker state');
        this.defineGauge('circuit.gpt4o.state', 'GPT-4o circuit breaker state');
        this.defineGauge('circuit.claude.state', 'Claude circuit breaker state');
        this.defineGauge('circuit.ollama.state', 'Ollama circuit breaker state');

        // Latency histograms
        this.defineHistogram('agent.latency.ms', 'Agent execution latency in ms', [50, 100, 250, 500, 1000, 2500, 5000, 10000]);
        this.defineHistogram('provider.latency.ms', 'AI provider latency in ms', [100, 250, 500, 1000, 2500, 5000]);

        // Compliance
        this.defineCounter('compliance.pii.detected', 'PII detections');
        this.defineCounter('compliance.audit.entries', 'Audit log entries');
        this.defineCounter('compliance.erasure.requests', 'GDPR erasure requests');

        // Tenant metrics
        this.defineGauge('tenants.active', 'Active tenant count');
        this.defineGauge('tenants.total', 'Total tenant count');

        // System
        this.defineGauge('system.uptime.seconds', 'System uptime in seconds');
        this.defineGauge('system.memory.heapUsed', 'Heap memory used (bytes)');
        this.defineGauge('system.memory.rss', 'RSS memory (bytes)');
        this.defineGauge('system.cpu.user', 'CPU user time (microseconds)');
        this.defineGauge('system.agents.registered', 'Total registered agents');
    }

    // ── Counter (monotonically increasing) ──

    defineCounter(name, description) {
        this.counters.set(name, { value: 0, description, createdAt: Date.now() });
    }

    increment(name, value = 1) {
        const counter = this.counters.get(name);
        if (counter) {
            counter.value += value;
            this._queueForCloud(name, counter.value, 'DOUBLE');
        }
    }

    // ── Gauge (point-in-time value) ──

    defineGauge(name, description) {
        this.gauges.set(name, { value: 0, description, updatedAt: Date.now() });
    }

    setGauge(name, value) {
        const gauge = this.gauges.get(name);
        if (gauge) {
            gauge.value = value;
            gauge.updatedAt = Date.now();
            this._queueForCloud(name, gauge.value, 'INT64');
        }
    }

    // ── Histogram (distribution) ──

    defineHistogram(name, description, buckets) {
        this.histograms.set(name, {
            description,
            buckets: buckets.map(b => ({ le: b, count: 0 })),
            sum: 0,
            count: 0,
            createdAt: Date.now(),
        });
    }

    observe(name, value) {
        const histogram = this.histograms.get(name);
        if (!histogram) return;

        histogram.sum += value;
        histogram.count++;
        for (const bucket of histogram.buckets) {
            if (value <= bucket.le) bucket.count++;
        }
    }

    // ── System Gauges ──

    _updateSystemGauges() {
        const mem = process.memoryUsage();
        const cpu = process.cpuUsage();

        this.setGauge('system.uptime.seconds', Math.floor((Date.now() - this.startTime) / 1000));
        this.setGauge('system.memory.heapUsed', mem.heapUsed);
        this.setGauge('system.memory.rss', mem.rss);
        this.setGauge('system.cpu.user', cpu.user);
    }

    // ── Google Cloud Monitoring ──

    _queueForCloud(name, value, type) {
        if (!PROJECT_ID) return;
        this.cloudBuffer.push({ name, value, type, timestamp: Date.now() });
    }

    async _flushCloudMetrics() {
        if (!PROJECT_ID || this.cloudBuffer.length === 0) return;

        // Take snapshot and clear buffer
        const batch = this.cloudBuffer.splice(0, 100);

        const timeSeries = batch.map(m => ({
            metric: {
                type: `custom.googleapis.com/alti-code-studio/${m.name}`,
            },
            resource: {
                type: 'global',
                labels: { project_id: PROJECT_ID },
            },
            points: [{
                interval: {
                    endTime: {
                        seconds: Math.floor(m.timestamp / 1000),
                    },
                },
                value: m.type === 'INT64' ? { int64Value: Math.floor(m.value) } : { doubleValue: Number(m.value) },
            }],
        }));

        try {
            await metricClient.createTimeSeries({
                name: metricClient.projectPath(PROJECT_ID),
                timeSeries,
            });
            logger.debug(`📊 Cloud Monitoring: flushed ${timeSeries.length} metrics`);
        } catch (err) {
            logger.warn(`⚠️ Cloud Monitoring flush failed (${err.message})`);
        }
    }

    // ── Export All Metrics ──

    toJSON() {
        this._updateSystemGauges();

        const counters = {};
        for (const [name, data] of this.counters) {
            counters[name] = { value: data.value, description: data.description };
        }

        const gauges = {};
        for (const [name, data] of this.gauges) {
            gauges[name] = { value: data.value, description: data.description };
        }

        const histograms = {};
        for (const [name, data] of this.histograms) {
            histograms[name] = {
                description: data.description,
                count: data.count,
                sum: data.sum,
                avg: data.count > 0 ? Math.round(data.sum / data.count) : 0,
                buckets: data.buckets.map(b => ({ le: b.le, count: b.count })),
            };
        }

        return { counters, gauges, histograms, exportedAt: new Date().toISOString() };
    }

    // ── Prometheus Format ──

    toPrometheus() {
        this._updateSystemGauges();
        let output = '';

        for (const [name, data] of this.counters) {
            const metricName = name.replace(/\./g, '_');
            output += `# HELP ${metricName} ${data.description}\n`;
            output += `# TYPE ${metricName} counter\n`;
            output += `${metricName} ${data.value}\n`;
        }

        for (const [name, data] of this.gauges) {
            const metricName = name.replace(/\./g, '_');
            output += `# HELP ${metricName} ${data.description}\n`;
            output += `# TYPE ${metricName} gauge\n`;
            output += `${metricName} ${data.value}\n`;
        }

        for (const [name, data] of this.histograms) {
            const metricName = name.replace(/\./g, '_');
            output += `# HELP ${metricName} ${data.description}\n`;
            output += `# TYPE ${metricName} histogram\n`;
            for (const bucket of data.buckets) {
                output += `${metricName}_bucket{le="${bucket.le}"} ${bucket.count}\n`;
            }
            output += `${metricName}_sum ${data.sum}\n`;
            output += `${metricName}_count ${data.count}\n`;
        }

        return output;
    }
}

// ═══════════════════════════════════════════════
// Distributed Tracer (Cloud Trace compatible)
// ═══════════════════════════════════════════════

class DistributedTracer {
    constructor() {
        this.activeSpans = new Map();
        this.completedTraces = [];
        this.maxTraces = 10000;
    }

    startSpan(traceId, spanName, metadata = {}) {
        const span = {
            traceId,
            spanId: `span_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            name: spanName,
            startTime: Date.now(),
            endTime: null,
            status: 'IN_PROGRESS',
            metadata,
            children: [],
        };

        this.activeSpans.set(span.spanId, span);
        return span;
    }

    endSpan(spanId, result = {}) {
        const span = this.activeSpans.get(spanId);
        if (!span) return null;

        span.endTime = Date.now();
        span.durationMs = span.endTime - span.startTime;
        span.status = result.error ? 'ERROR' : 'OK';
        span.result = result;

        this.activeSpans.delete(spanId);
        this.completedTraces.push(span);

        // Rolling window
        if (this.completedTraces.length > this.maxTraces) {
            this.completedTraces = this.completedTraces.slice(-this.maxTraces / 2);
        }

        return span;
    }

    getTrace(traceId) {
        return this.completedTraces.filter(s => s.traceId === traceId);
    }

    getRecentTraces(limit = 50) {
        return this.completedTraces.slice(-limit);
    }

    getStats() {
        const avgDuration = this.completedTraces.length > 0
            ? Math.round(this.completedTraces.reduce((s, t) => s + (t.durationMs || 0), 0) / this.completedTraces.length)
            : 0;

        return {
            activeSpans: this.activeSpans.size,
            completedTraces: this.completedTraces.length,
            avgDurationMs: avgDuration,
            errorRate: this.completedTraces.length > 0
                ? Math.round(this.completedTraces.filter(t => t.status === 'ERROR').length / this.completedTraces.length * 100)
                : 0,
        };
    }
}

// ═══════════════════════════════════════════════
// Agent Performance Dashboard API
// ═══════════════════════════════════════════════

class AgentDashboard {
    constructor(metrics, tracer) {
        this.metrics = metrics;
        this.tracer = tracer;
    }

    /**
     * Get a complete system snapshot for the enterprise dashboard.
     */
    getSystemSnapshot() {
        const mem = process.memoryUsage();
        const cpu = process.cpuUsage();

        return {
            system: {
                uptime: process.uptime(),
                memory: {
                    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
                    rss: Math.round(mem.rss / 1024 / 1024),
                    external: Math.round(mem.external / 1024 / 1024),
                    unit: 'MB',
                },
                cpu: {
                    user: Math.round(cpu.user / 1000),
                    system: Math.round(cpu.system / 1000),
                    unit: 'ms',
                },
                nodeVersion: process.version,
                platform: process.platform,
            },
            metrics: this.metrics.toJSON(),
            tracing: this.tracer.getStats(),
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Get per-agent performance breakdown.
     */
    getAgentPerformance(agentName) {
        const traces = this.tracer.completedTraces.filter(t =>
            t.metadata?.agentName === agentName
        );

        if (traces.length === 0) {
            return { agentName, totalCalls: 0, avgLatency: 0, errorRate: 0 };
        }

        const total = traces.length;
        const errors = traces.filter(t => t.status === 'ERROR').length;
        const avgLatency = Math.round(traces.reduce((s, t) => s + (t.durationMs || 0), 0) / total);
        const p95 = traces
            .map(t => t.durationMs || 0)
            .sort((a, b) => a - b)[Math.floor(total * 0.95)] || 0;

        return {
            agentName,
            totalCalls: total,
            avgLatencyMs: avgLatency,
            p95LatencyMs: p95,
            errorRate: Math.round(errors / total * 100),
            lastCall: traces[traces.length - 1]?.endTime
                ? new Date(traces[traces.length - 1].endTime).toISOString()
                : null,
        };
    }

    /**
     * Get SLA compliance report.
     */
    getSLAReport() {
        const traces = this.tracer.completedTraces;
        const total = traces.length;
        const successful = traces.filter(t => t.status === 'OK').length;
        const availability = total > 0 ? (successful / total * 100).toFixed(4) : '100.0000';

        return {
            totalRequests: total,
            successful,
            failed: total - successful,
            availability: `${availability}%`,
            slaTarget: '99.99%',
            slaViolation: parseFloat(availability) < 99.99,
            measuredSince: this.metrics.startTime
                ? new Date(this.metrics.startTime).toISOString()
                : new Date().toISOString(),
        };
    }
}

// ═══════════════════════════════════════════════
// Singletons
// ═══════════════════════════════════════════════

export const metrics = new MetricCollector();
export const tracer = new DistributedTracer();
export const dashboard = new AgentDashboard(metrics, tracer);
