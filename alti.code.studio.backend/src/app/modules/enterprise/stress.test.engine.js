/**
 * Copyright (c) 2024 Inso Code
 * 
 * E2E STRESS TEST SUITE (Phase 56)
 * 
 * Enterprise load testing & benchmarking framework:
 *   - Concurrent tenant simulation
 *   - Memory/CPU profiling under load
 *   - Throughput measurement (ops/sec)
 *   - Latency percentile calculation (p50/p95/p99)
 *   - Regression benchmark tracking
 *   - Module-level stress tests
 *   - Report generation with pass/fail criteria
 */

import { logger } from '../../../shared/logger.js';

// ═══════════════════════════════════════════════
// Stress Test Framework
// ═══════════════════════════════════════════════

const BENCHMARK_THRESHOLDS = {
    maxP99Latency: 200,   // ms
    minThroughput: 100,   // ops/sec
    maxMemoryGrowth: 50,    // MB
    maxErrorRate: 0.01,  // 1%
};

class StressTestEngine {
    constructor() {
        this.suites = new Map();
        this.results = [];
        this.stats = { totalRuns: 0, totalPassed: 0, totalFailed: 0 };
    }

    // ── Register Test Suite ──

    registerSuite(name, testFn, options = {}) {
        const suite = {
            name,
            testFn,
            concurrency: options.concurrency || 10,
            iterations: options.iterations || 100,
            warmup: options.warmup || 10,
            thresholds: { ...BENCHMARK_THRESHOLDS, ...(options.thresholds || {}) },
        };
        this.suites.set(name, suite);
        return { registered: name };
    }

    // ── Run Suite ──

    async runSuite(suiteName) {
        const suite = this.suites.get(suiteName);
        if (!suite) throw new Error(`Suite not found: ${suiteName}`);

        // Warmup
        for (let i = 0; i < suite.warmup; i++) {
            try { await suite.testFn(i, 'warmup'); } catch (e) { /* warmup errors ignored */ }
        }

        const startMem = process.memoryUsage().heapUsed;
        const latencies = [];
        let errors = 0;
        const startTime = Date.now();

        // Execute concurrently in batches
        const batchSize = suite.concurrency;
        for (let batch = 0; batch < suite.iterations; batch += batchSize) {
            const batchPromises = [];
            const count = Math.min(batchSize, suite.iterations - batch);

            for (let i = 0; i < count; i++) {
                const iterStart = Date.now();
                batchPromises.push(
                    Promise.resolve()
                        .then(() => suite.testFn(batch + i, 'test'))
                        .then(() => { latencies.push(Date.now() - iterStart); })
                        .catch(() => { errors++; latencies.push(Date.now() - iterStart); })
                );
            }
            await Promise.all(batchPromises);
        }

        const totalDuration = Date.now() - startTime;
        const endMem = process.memoryUsage().heapUsed;

        // Compute percentiles
        latencies.sort((a, b) => a - b);
        const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
        const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
        const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
        const avg = latencies.reduce((s, l) => s + l, 0) / latencies.length || 0;

        const throughput = (suite.iterations / (totalDuration / 1000)).toFixed(1);
        const memGrowthMB = Math.round((endMem - startMem) / 1024 / 1024 * 100) / 100;
        const errorRate = errors / suite.iterations;

        // Evaluate thresholds
        const checks = {
            p99Latency: p99 <= suite.thresholds.maxP99Latency,
            throughput: parseFloat(throughput) >= suite.thresholds.minThroughput,
            memoryGrowth: memGrowthMB <= suite.thresholds.maxMemoryGrowth,
            errorRate: errorRate <= suite.thresholds.maxErrorRate,
        };

        const passed = Object.values(checks).every(Boolean);

        const result = {
            suite: suiteName,
            passed,
            iterations: suite.iterations,
            concurrency: suite.concurrency,
            duration: totalDuration,
            latency: { avg: Math.round(avg), p50, p95, p99 },
            throughput: parseFloat(throughput),
            memoryGrowth: memGrowthMB,
            errorRate: Math.round(errorRate * 10000) / 100,
            errors,
            checks,
            timestamp: new Date().toISOString(),
        };

        this.results.push(result);
        this.stats.totalRuns++;
        if (passed) this.stats.totalPassed++; else this.stats.totalFailed++;

        logger.info(`🏋️ Stress: ${suiteName} — ${passed ? '✅ PASS' : '❌ FAIL'} | ${throughput} ops/s | p99=${p99}ms`);
        return result;
    }

    // ── Run All Suites ──

    async runAll() {
        const results = [];
        for (const [name] of this.suites) {
            results.push(await this.runSuite(name));
        }
        return {
            total: results.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length,
            results,
        };
    }

    // ── Built-In Enterprise Stress Tests ──

    registerEnterpriseSuites(modules) {
        const { workflowEngine, dataPipeline, enterpriseSearch, agentMarketplace, cronEngine } = modules;

        if (workflowEngine) {
            this.registerSuite('workflow-execution', async (i) => {
                const def = workflowEngine.defineWorkflow({
                    name: `stress-wf-${i}`,
                    steps: [{ id: `s${i}`, type: 'agent', config: { agentName: 'stress' } }],
                });
                await workflowEngine.executeWorkflow(def.workflowId);
            }, { iterations: 50, concurrency: 5 });
        }

        if (dataPipeline) {
            this.registerSuite('pipeline-transform', (i) => {
                const pipe = dataPipeline.definePipeline({
                    name: `stress-pipe-${i}`,
                    stages: [{ type: 'filter', config: { field: 'score', operator: 'gte', value: 50 } }],
                });
                dataPipeline.executePipeline(pipe.pipelineId, [
                    { score: 80 }, { score: 30 }, { score: 90 },
                ]);
            }, { iterations: 100, concurrency: 10 });
        }

        if (enterpriseSearch) {
            this.registerSuite('search-index-query', (i) => {
                enterpriseSearch.index({
                    type: 'agent',
                    title: `Stress Agent ${i}`,
                    body: `Stress test document number ${i}`,
                    tenantId: `stress_${i % 5}`,
                });
                enterpriseSearch.search(`agent ${i % 10}`);
            }, { iterations: 100, concurrency: 10 });
        }

        if (agentMarketplace) {
            this.registerSuite('marketplace-publish', (i) => {
                agentMarketplace.publish({
                    name: `Stress Bot ${i}`,
                    publisherId: `pub_stress_${i}`,
                    category: 'custom',
                });
            }, { iterations: 50, concurrency: 5 });
        }

        return { registered: this.suites.size };
    }

    // ── Queries ──

    getResults(suiteName) {
        if (suiteName) return this.results.filter(r => r.suite === suiteName);
        return this.results;
    }

    getStats() {
        return {
            totalSuites: this.suites.size,
            totalRuns: this.stats.totalRuns,
            totalPassed: this.stats.totalPassed,
            totalFailed: this.stats.totalFailed,
            passRate: this.stats.totalRuns > 0
                ? `${Math.round(this.stats.totalPassed / this.stats.totalRuns * 100)}%`
                : '0%',
            thresholds: BENCHMARK_THRESHOLDS,
        };
    }
}

export const stressTestEngine = new StressTestEngine();
export { BENCHMARK_THRESHOLDS };
