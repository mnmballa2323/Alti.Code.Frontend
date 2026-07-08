/**
 * Load Test Runner
 * 
 * Built-in load testing for pre-deployment validation:
 * - Configurable concurrency and duration
 * - Latency percentile calculation
 * - Error rate tracking
 * - Results summary
 */

import { logger } from './logger.js';

class LoadTestRunner {
  constructor() {
    this.results = [];
  }

  async run(config) {
    const {
      name = 'Load Test',
      targetUrl,
      method = 'GET',
      headers = {},
      body = null,
      concurrency = 10,
      totalRequests = 100,
      timeoutMs = 10000,
    } = config;

    logger.info(`[LoadTest] Starting '${name}': ${totalRequests} requests, concurrency ${concurrency}`);
    const startTime = Date.now();
    const latencies = [];
    let successes = 0;
    let failures = 0;
    const statusCodes = {};

    const worker = async () => {
      while (latencies.length + failures < totalRequests) {
        const reqStart = Date.now();
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);

          const res = await fetch(targetUrl, {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });
          clearTimeout(timeout);

          const latency = Date.now() - reqStart;
          latencies.push(latency);
          statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;

          if (res.ok) successes++;
          else failures++;
        } catch {
          failures++;
        }
      }
    };

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    const duration = Date.now() - startTime;
    const sorted = [...latencies].sort((a, b) => a - b);

    const result = {
      name,
      timestamp: new Date().toISOString(),
      totalRequests: successes + failures,
      successes,
      failures,
      errorRate: failures / (successes + failures),
      durationMs: duration,
      rps: Math.round((successes + failures) / (duration / 1000)),
      latency: {
        min: sorted[0] || 0,
        max: sorted[sorted.length - 1] || 0,
        avg: sorted.length ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
        p50: this._percentile(sorted, 50),
        p95: this._percentile(sorted, 95),
        p99: this._percentile(sorted, 99),
      },
      statusCodes,
    };

    this.results.push(result);
    logger.info(`[LoadTest] '${name}' complete: ${result.rps} rps, p50=${result.latency.p50}ms, p95=${result.latency.p95}ms, errors=${failures}`);
    return result;
  }

  getResults() {
    return this.results;
  }

  _percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }
}

export const loadTestRunner = new LoadTestRunner();
