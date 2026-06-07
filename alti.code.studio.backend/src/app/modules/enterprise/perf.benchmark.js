/**
 * Copyright (c) 2024 Inso Code
 * 
 * AGENT PERFORMANCE BENCHMARKING (Phase 58)
 * 
 * Performance measurement & SLA compliance:
 *   - Latency tracking (p50/p75/p95/p99)
 *   - Token efficiency scoring
 *   - Throughput measurement per agent
 *   - SLA compliance (99.9%, 99.95%, 99.99%)
 *   - Error rate tracking
 *   - Comparative benchmarking
 *   - Performance trend analysis
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// SLA Tiers
// ═══════════════════════════════════════════════

const SLA_TIERS = {
    standard: { target: 0.999, label: '99.9%', maxLatencyP99: 500 },
    enhanced: { target: 0.9995, label: '99.95%', maxLatencyP99: 300 },
    premium: { target: 0.9999, label: '99.99%', maxLatencyP99: 100 },
};

const EFFICIENCY_GRADES = {
    A: { min: 90, label: 'Excellent — Optimal token usage' },
    B: { min: 75, label: 'Good — Within expected range' },
    C: { min: 60, label: 'Fair — Room for optimization' },
    D: { min: 40, label: 'Poor — Significant waste' },
    F: { min: 0, label: 'Critical — Requires immediate attention' },
};

class PerfBenchmark {
    constructor() {
        this.metrics = new Map();     // agentName → metrics[]
        this.slaConfigs = new Map();  // agentName → SLA tier
        this.stats = { totalRecords: 0, totalAgents: 0 };
    }

    // ── Record Metric ──

    record(agentName, metric) {
        if (!this.metrics.has(agentName)) {
            this.metrics.set(agentName, []);
            this.stats.totalAgents++;
        }

        const entry = {
            id: `perf_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
            latency: metric.latency || 0,
            tokensUsed: metric.tokensUsed || 0,
            tokensOptimal: metric.tokensOptimal || metric.tokensUsed,
            success: metric.success !== false,
            timestamp: new Date().toISOString(),
        };

        this.metrics.get(agentName).push(entry);
        this.stats.totalRecords++;

        return { recorded: true, agentName };
    }

    // ── Percentile Calculation ──

    getLatencyPercentiles(agentName) {
        const entries = this.metrics.get(agentName);
        if (!entries || entries.length === 0) return null;

        const sorted = entries.map(e => e.latency).sort((a, b) => a - b);
        const len = sorted.length;

        return {
            agentName,
            count: len,
            min: sorted[0],
            max: sorted[len - 1],
            avg: Math.round(sorted.reduce((s, l) => s + l, 0) / len),
            p50: sorted[Math.floor(len * 0.50)],
            p75: sorted[Math.floor(len * 0.75)],
            p95: sorted[Math.floor(len * 0.95)],
            p99: sorted[Math.floor(len * 0.99)],
        };
    }

    // ── Token Efficiency ──

    getTokenEfficiency(agentName) {
        const entries = this.metrics.get(agentName);
        if (!entries || entries.length === 0) return null;

        const totalUsed = entries.reduce((s, e) => s + e.tokensUsed, 0);
        const totalOptimal = entries.reduce((s, e) => s + e.tokensOptimal, 0);
        const efficiency = totalOptimal > 0 ? (totalOptimal / totalUsed * 100) : 100;
        const score = Math.min(100, Math.round(efficiency));

        let grade = 'F';
        for (const [g, config] of Object.entries(EFFICIENCY_GRADES)) {
            if (score >= config.min) { grade = g; break; }
        }

        return {
            agentName,
            totalTokensUsed: totalUsed,
            totalTokensOptimal: totalOptimal,
            efficiency: `${score}%`,
            grade,
            gradeLabel: EFFICIENCY_GRADES[grade].label,
            dispatches: entries.length,
        };
    }

    // ── SLA Compliance ──

    setSLA(agentName, tier = 'standard') {
        if (!SLA_TIERS[tier]) throw new Error(`Unknown SLA tier: ${tier}`);
        this.slaConfigs.set(agentName, tier);
        return { agentName, tier, target: SLA_TIERS[tier].label };
    }

    getSLACompliance(agentName) {
        const entries = this.metrics.get(agentName);
        if (!entries || entries.length === 0) return null;

        const tier = this.slaConfigs.get(agentName) || 'standard';
        const sla = SLA_TIERS[tier];

        const total = entries.length;
        const successful = entries.filter(e => e.success).length;
        const availability = successful / total;
        const compliant = availability >= sla.target;

        const p99 = this.getLatencyPercentiles(agentName)?.p99 || 0;
        const latencyCompliant = p99 <= sla.maxLatencyP99;

        return {
            agentName,
            tier,
            target: sla.label,
            actual: `${(availability * 100).toFixed(3)}%`,
            compliant: compliant && latencyCompliant,
            availability: { target: sla.target, actual: availability, met: compliant },
            latency: { maxP99: sla.maxLatencyP99, actualP99: p99, met: latencyCompliant },
            totalDispatches: total,
            successfulDispatches: successful,
        };
    }

    // ── Error Rate ──

    getErrorRate(agentName) {
        const entries = this.metrics.get(agentName);
        if (!entries || entries.length === 0) return null;

        const total = entries.length;
        const errors = entries.filter(e => !e.success).length;

        return {
            agentName,
            total,
            errors,
            errorRate: `${Math.round(errors / total * 10000) / 100}%`,
        };
    }

    // ── Comparative Benchmark ──

    compareAgents(agentNames) {
        const results = agentNames.map(name => ({
            agent: name,
            percentiles: this.getLatencyPercentiles(name),
            efficiency: this.getTokenEfficiency(name),
            sla: this.getSLACompliance(name),
            errorRate: this.getErrorRate(name),
        })).filter(r => r.percentiles);

        // Rank by p99 latency
        results.sort((a, b) => (a.percentiles?.p99 || 0) - (b.percentiles?.p99 || 0));

        return {
            compared: results.length,
            ranking: results.map((r, i) => ({
                rank: i + 1,
                agent: r.agent,
                p99: r.percentiles?.p99,
                efficiency: r.efficiency?.grade,
                compliant: r.sla?.compliant,
            })),
            detailed: results,
        };
    }

    // ── Queries ──

    listAgents() {
        return [...this.metrics.keys()].map(name => ({
            name,
            records: this.metrics.get(name).length,
            sla: this.slaConfigs.get(name) || 'standard',
        }));
    }

    getStats() {
        return {
            totalAgents: this.stats.totalAgents,
            totalRecords: this.stats.totalRecords,
            slaTiers: Object.keys(SLA_TIERS).length,
            efficiencyGrades: Object.keys(EFFICIENCY_GRADES).length,
            agentsWithSLA: this.slaConfigs.size,
        };
    }
}

export const perfBenchmark = new PerfBenchmark();
export { SLA_TIERS, EFFICIENCY_GRADES };
