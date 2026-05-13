/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * MULTI-REGION FAILOVER CONTROLLER (Phase 36)
 * 
 * Manages multi-region GKE clusters with:
 *   - Active-passive and active-active failover
 *   - Health monitoring per region
 *   - Traffic routing / weighted traffic split
 *   - Disaster recovery with RTO/RPO tracking
 *   - Automated failover triggers
 * 
 * GCP Regions Supported:
 *   US: us-central1, us-east1, us-west1
 *   EU: europe-west1, europe-west3, europe-north1
 *   APAC: asia-east1, asia-southeast1
 *   MENA: me-west1
 */

import { logger } from '../../../shared/logger.js';

// ═══════════════════════════════════════════════
// Region Configuration
// ═══════════════════════════════════════════════

const REGIONS = {
    'us-central1': { zone: 'US', displayName: 'Iowa', tier: 'primary' },
    'us-east1': { zone: 'US', displayName: 'S. Carolina', tier: 'secondary' },
    'us-west1': { zone: 'US', displayName: 'Oregon', tier: 'secondary' },
    'europe-west1': { zone: 'EU', displayName: 'Belgium', tier: 'primary' },
    'europe-west3': { zone: 'EU', displayName: 'Frankfurt', tier: 'secondary' },
    'europe-north1': { zone: 'EU', displayName: 'Finland', tier: 'secondary' },
    'asia-east1': { zone: 'APAC', displayName: 'Taiwan', tier: 'primary' },
    'asia-southeast1': { zone: 'APAC', displayName: 'Singapore', tier: 'secondary' },
    'me-west1': { zone: 'MENA', displayName: 'Tel Aviv', tier: 'primary' },
};

// ═══════════════════════════════════════════════
// Multi-Region Controller
// ═══════════════════════════════════════════════

class MultiRegionController {
    constructor() {
        this.clusters = new Map();
        this.failoverMode = 'ACTIVE_PASSIVE'; // ACTIVE_PASSIVE | ACTIVE_ACTIVE
        this.trafficWeights = new Map();
        this.healthHistory = [];
        this.failoverEvents = [];
        this.drConfig = {
            rtoTargetSeconds: 120,     // Recovery Time Objective: 2 minutes
            rpoTargetSeconds: 30,      // Recovery Point Objective: 30 seconds
            lastBackup: null,
            backupIntervalMs: 30000,
        };

        // Bootstrap default US cluster
        this.registerCluster('us-central1', { isPrimary: true });
    }

    // ═══════════════════════════════
    // Cluster Management
    // ═══════════════════════════════

    registerCluster(region, options = {}) {
        const regionInfo = REGIONS[region];
        if (!regionInfo) throw new Error(`Unknown region: ${region}`);

        const cluster = {
            region,
            displayName: regionInfo.displayName,
            zone: regionInfo.zone,
            tier: regionInfo.tier,
            isPrimary: options.isPrimary || false,
            status: 'HEALTHY',
            endpoint: options.endpoint || `https://gke-${region}.alti.code.studio`,
            registeredAt: new Date().toISOString(),
            lastHealthCheck: null,
            healthScore: 100,
            metrics: {
                requestsPerSecond: 0,
                avgLatencyMs: 0,
                errorRate: 0,
                cpuUtilization: 0,
                memoryUtilization: 0,
                podCount: 0,
            },
            failoverCount: 0,
        };

        this.clusters.set(region, cluster);

        // Default traffic weight
        if (cluster.isPrimary) {
            this.trafficWeights.set(region, 100);
        } else {
            this.trafficWeights.set(region, 0);
        }

        logger.info(`🌐 Registered cluster: ${region} (${regionInfo.displayName}) [${cluster.isPrimary ? 'PRIMARY' : 'STANDBY'}]`);
        return cluster;
    }

    // ═══════════════════════════════
    // Health Monitoring
    // ═══════════════════════════════

    async checkHealth(region) {
        const cluster = this.clusters.get(region);
        if (!cluster) throw new Error(`Cluster not found: ${region}`);

        // Simulate health check (in production: actual HTTP/gRPC probe)
        const health = {
            region,
            timestamp: new Date().toISOString(),
            latencyMs: Math.random() * 200,
            status: 'HEALTHY',
            checks: {
                api: true,
                database: true,
                redis: true,
                aiProviders: true,
            },
        };

        // Calculate health score
        let score = 100;
        if (!health.checks.api) score -= 40;
        if (!health.checks.database) score -= 30;
        if (!health.checks.redis) score -= 15;
        if (!health.checks.aiProviders) score -= 15;

        cluster.healthScore = score;
        cluster.lastHealthCheck = health.timestamp;

        if (score < 50) {
            cluster.status = 'UNHEALTHY';
            health.status = 'UNHEALTHY';
        } else if (score < 80) {
            cluster.status = 'DEGRADED';
            health.status = 'DEGRADED';
        } else {
            cluster.status = 'HEALTHY';
        }

        this.healthHistory.push(health);
        if (this.healthHistory.length > 1000) {
            this.healthHistory = this.healthHistory.slice(-500);
        }

        return health;
    }

    async checkAllHealth() {
        const results = {};
        for (const region of this.clusters.keys()) {
            results[region] = await this.checkHealth(region);
        }
        return results;
    }

    // ═══════════════════════════════
    // Failover Engine
    // ═══════════════════════════════

    async triggerFailover(fromRegion, reason = 'manual') {
        const sourceCluster = this.clusters.get(fromRegion);
        if (!sourceCluster) throw new Error(`Source cluster not found: ${fromRegion}`);

        // Find best target
        const target = this._findBestFailoverTarget(fromRegion);
        if (!target) throw new Error('No healthy failover target available');

        const failoverEvent = {
            id: `fo_${Date.now()}`,
            from: fromRegion,
            to: target.region,
            reason,
            triggeredAt: new Date().toISOString(),
            completedAt: null,
            rtoMs: null,
            status: 'IN_PROGRESS',
        };

        logger.warn(`🔄 FAILOVER: ${fromRegion} → ${target.region} (reason: ${reason})`);

        // 1. Mark source as draining
        sourceCluster.status = 'DRAINING';
        sourceCluster.failoverCount++;

        // 2. Promote target to primary
        target.isPrimary = true;
        sourceCluster.isPrimary = false;

        // 3. Shift traffic
        const oldWeight = this.trafficWeights.get(fromRegion) || 0;
        this.trafficWeights.set(fromRegion, 0);
        this.trafficWeights.set(target.region, oldWeight || 100);

        // 4. Complete failover
        failoverEvent.completedAt = new Date().toISOString();
        failoverEvent.rtoMs = new Date(failoverEvent.completedAt) - new Date(failoverEvent.triggeredAt);
        failoverEvent.status = failoverEvent.rtoMs <= this.drConfig.rtoTargetSeconds * 1000 ? 'SUCCESS' : 'SUCCESS_SLOW';

        this.failoverEvents.push(failoverEvent);

        logger.info(`✅ Failover complete: ${target.region} is now PRIMARY (RTO: ${failoverEvent.rtoMs}ms)`);
        return failoverEvent;
    }

    _findBestFailoverTarget(excludeRegion) {
        let best = null;
        let bestScore = -1;

        for (const [region, cluster] of this.clusters) {
            if (region === excludeRegion) continue;
            if (cluster.status === 'UNHEALTHY' || cluster.status === 'DRAINING') continue;

            // Prefer same zone, then higher health score
            const zoneBonus = cluster.zone === this.clusters.get(excludeRegion)?.zone ? 20 : 0;
            const tierBonus = cluster.tier === 'secondary' ? 10 : 0;
            const score = cluster.healthScore + zoneBonus + tierBonus;

            if (score > bestScore) {
                bestScore = score;
                best = cluster;
            }
        }

        return best;
    }

    // ═══════════════════════════════
    // Traffic Routing
    // ═══════════════════════════════

    setTrafficWeights(weights) {
        const total = Object.values(weights).reduce((s, v) => s + v, 0);
        if (total !== 100) throw new Error(`Traffic weights must sum to 100, got ${total}`);

        for (const [region, weight] of Object.entries(weights)) {
            if (!this.clusters.has(region)) throw new Error(`Unknown region: ${region}`);
            this.trafficWeights.set(region, weight);
        }

        logger.info(`🔀 Traffic weights updated: ${JSON.stringify(weights)}`);
        return Object.fromEntries(this.trafficWeights);
    }

    routeRequest(tenantZone) {
        // Route to closest healthy cluster in the tenant's zone
        const candidates = [];
        for (const [region, cluster] of this.clusters) {
            if (cluster.status === 'HEALTHY' || cluster.status === 'DEGRADED') {
                const weight = this.trafficWeights.get(region) || 0;
                if (weight > 0) {
                    const zoneMatch = cluster.zone === tenantZone;
                    candidates.push({ region, weight, zoneMatch, healthScore: cluster.healthScore });
                }
            }
        }

        if (candidates.length === 0) {
            // Emergency: route to any healthy cluster
            for (const [region, cluster] of this.clusters) {
                if (cluster.status !== 'UNHEALTHY' && cluster.status !== 'DRAINING') {
                    return { region, endpoint: cluster.endpoint, fallback: true };
                }
            }
            throw new Error('All clusters unavailable');
        }

        // Prefer zone match, then highest weight
        candidates.sort((a, b) => {
            if (a.zoneMatch !== b.zoneMatch) return b.zoneMatch - a.zoneMatch;
            return b.weight - a.weight;
        });

        const selected = candidates[0];
        const cluster = this.clusters.get(selected.region);
        return { region: selected.region, endpoint: cluster.endpoint, fallback: false };
    }

    // ═══════════════════════════════
    // Disaster Recovery
    // ═══════════════════════════════

    getDisasterRecoveryStatus() {
        const now = Date.now();
        const lastBackupAge = this.drConfig.lastBackup
            ? Math.round((now - new Date(this.drConfig.lastBackup).getTime()) / 1000)
            : null;

        const lastFailover = this.failoverEvents[this.failoverEvents.length - 1];
        const avgRto = this.failoverEvents.length > 0
            ? Math.round(this.failoverEvents.reduce((s, e) => s + (e.rtoMs || 0), 0) / this.failoverEvents.length)
            : 0;

        return {
            rtoTarget: `${this.drConfig.rtoTargetSeconds}s`,
            rpoTarget: `${this.drConfig.rpoTargetSeconds}s`,
            avgRtoActual: `${avgRto}ms`,
            lastBackup: this.drConfig.lastBackup,
            lastBackupAge: lastBackupAge !== null ? `${lastBackupAge}s` : 'never',
            rpoMet: lastBackupAge !== null ? lastBackupAge <= this.drConfig.rpoTargetSeconds : false,
            totalFailovers: this.failoverEvents.length,
            lastFailover: lastFailover || null,
            clusters: this.getClustersStatus(),
        };
    }

    recordBackup() {
        this.drConfig.lastBackup = new Date().toISOString();
        return { backed_up_at: this.drConfig.lastBackup };
    }

    // ═══════════════════════════════
    // Status & Reporting
    // ═══════════════════════════════

    getClustersStatus() {
        const status = [];
        for (const [region, cluster] of this.clusters) {
            status.push({
                region,
                displayName: cluster.displayName,
                zone: cluster.zone,
                isPrimary: cluster.isPrimary,
                status: cluster.status,
                healthScore: cluster.healthScore,
                trafficWeight: this.trafficWeights.get(region) || 0,
                failoverCount: cluster.failoverCount,
                lastHealthCheck: cluster.lastHealthCheck,
            });
        }
        return status;
    }

    getStats() {
        return {
            totalClusters: this.clusters.size,
            healthyClusters: [...this.clusters.values()].filter(c => c.status === 'HEALTHY').length,
            failoverMode: this.failoverMode,
            trafficWeights: Object.fromEntries(this.trafficWeights),
            totalFailovers: this.failoverEvents.length,
        };
    }
}

export const multiRegion = new MultiRegionController();
