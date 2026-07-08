/**
 * Custom Application Metrics for Cloud Monitoring
 * 
 * Tracks business-level metrics that infrastructure metrics can't capture:
 * - Agent executions per minute
 * - Token consumption (input/output)
 * - Active sessions
 * - Queue depth
 * - Inference latency by model
 */

import { logger } from './logger.js';

class ApplicationMetrics {
  constructor() {
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
    this.isEnabled = false;
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this._flushInterval = null;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test') return;
    if (!this.projectId) {
      logger.warn('[Metrics] GCP_PROJECT_ID not set, using in-memory metrics only');
      return;
    }

    try {
      const monitoring = await import('@google-cloud/monitoring');
      this.client = new monitoring.MetricServiceClient();
      this.isEnabled = true;
      
      // Flush metrics to Cloud Monitoring every 60 seconds
      this._flushInterval = setInterval(() => this._flush(), 60000);
      logger.info('[Metrics] Custom application metrics initialized');
    } catch (err) {
      logger.warn('[Metrics] Cloud Monitoring SDK not available, using in-memory metrics:', err.message);
    }
  }

  // ── Counter: Monotonically increasing value ──
  incrementCounter(name, value = 1, labels = {}) {
    const key = this._key(name, labels);
    const current = this.counters.get(key) || { name, value: 0, labels };
    current.value += value;
    this.counters.set(key, current);
  }

  // ── Gauge: Point-in-time value ──
  setGauge(name, value, labels = {}) {
    const key = this._key(name, labels);
    this.gauges.set(key, { name, value, labels });
  }

  // ── Histogram: Record a value for distribution ──
  recordHistogram(name, value, labels = {}) {
    const key = this._key(name, labels);
    const current = this.histograms.get(key) || { name, values: [], labels };
    current.values.push(value);
    // Keep last 1000 values to prevent memory leak
    if (current.values.length > 1000) {
      current.values = current.values.slice(-1000);
    }
    this.histograms.set(key, current);
  }

  // ── Convenience Methods ──

  /** Track an agent execution */
  trackAgentExecution(agentType, durationMs, success = true) {
    this.incrementCounter('agent_executions_total', 1, { agent_type: agentType, status: success ? 'success' : 'failure' });
    this.recordHistogram('agent_execution_duration_ms', durationMs, { agent_type: agentType });
  }

  /** Track token consumption */
  trackTokenUsage(model, inputTokens, outputTokens) {
    this.incrementCounter('token_input_total', inputTokens, { model });
    this.incrementCounter('token_output_total', outputTokens, { model });
  }

  /** Track active sessions */
  setActiveSessions(count) {
    this.setGauge('active_sessions', count);
  }

  /** Track inference latency */
  trackInferenceLatency(model, latencyMs) {
    this.recordHistogram('inference_latency_ms', latencyMs, { model });
  }

  /** Track queue depth */
  setQueueDepth(queueName, depth) {
    this.setGauge('queue_depth', depth, { queue: queueName });
  }

  /** Track API request */
  trackApiRequest(method, path, statusCode, durationMs) {
    this.incrementCounter('api_requests_total', 1, { method, path: this._normalizePath(path), status: String(statusCode) });
    this.recordHistogram('api_request_duration_ms', durationMs, { method, path: this._normalizePath(path) });
  }

  // ── Internal ──

  _key(name, labels) {
    return `${name}:${JSON.stringify(labels)}`;
  }

  _normalizePath(path) {
    // Normalize dynamic path segments: /api/v1/users/123 → /api/v1/users/:id
    return path.replace(/\/[0-9a-f]{24}/g, '/:id').replace(/\/\d+/g, '/:id');
  }

  async _flush() {
    if (!this.isEnabled || !this.client) return;

    const projectPath = this.client.projectPath(this.projectId);
    const now = { seconds: Math.floor(Date.now() / 1000) };

    for (const [, counter] of this.counters) {
      try {
        await this.client.createTimeSeries({
          name: projectPath,
          timeSeries: [{
            metric: {
              type: `custom.googleapis.com/alti/${counter.name}`,
              labels: counter.labels,
            },
            resource: { type: 'global', labels: { project_id: this.projectId } },
            points: [{
              interval: { endTime: now },
              value: { int64Value: counter.value },
            }],
          }],
        });
      } catch (err) {
        // Silently skip — custom metric descriptor might need creation first
        logger.debug(`[Metrics] Failed to flush counter ${counter.name}:`, err.message);
      }
    }
  }

  /** Get local metrics snapshot (for health endpoints) */
  getSnapshot() {
    const snapshot = { counters: {}, gauges: {}, histograms: {} };
    for (const [key, val] of this.counters) snapshot.counters[key] = val.value;
    for (const [key, val] of this.gauges) snapshot.gauges[key] = val.value;
    for (const [key, val] of this.histograms) {
      const sorted = [...val.values].sort((a, b) => a - b);
      snapshot.histograms[key] = {
        count: sorted.length,
        p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
        p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
        p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
        avg: sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
      };
    }
    return snapshot;
  }

  async shutdown() {
    if (this._flushInterval) clearInterval(this._flushInterval);
    await this._flush();
  }
}

export const metrics = new ApplicationMetrics();
