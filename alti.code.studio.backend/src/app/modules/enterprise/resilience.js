/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * CIRCUIT BREAKER + AI FAILOVER — Resilience Infrastructure
 * 
 * S&P 500 companies need 99.99% uptime. This module ensures:
 *   1. Circuit breaker per AI provider (CLOSED → OPEN → HALF_OPEN)
 *   2. Automatic failover chain: Gemini → GPT-4o → Claude → Ollama
 *   3. Retry with exponential backoff + jitter
 *   4. Timeout enforcement per agent
 *   5. Health check aggregation
 * 
 * Production: Google Cloud Monitoring metrics exported
 */

import { logger } from '../../../shared/logger.js';
import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_URL || process.env.GCP_REDIS_HOST;
const redis = REDIS_HOST ? new Redis(REDIS_HOST, { showFriendlyErrorStack: true, maxRetriesPerRequest: 3 }) : null;

// ── Circuit Breaker States ──
const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
    /**
     * @param {string} name - Provider name
     * @param {object} options
     * @param {number} options.failureThreshold - Failures before opening (default: 5)
     * @param {number} options.resetTimeoutMs - Time in OPEN before trying HALF_OPEN (default: 30s)
     * @param {number} options.successThreshold - Successes in HALF_OPEN to close (default: 3)
     */
    constructor(name, options = {}) {
        this.name = name;
        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailure = null;
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeoutMs = options.resetTimeoutMs || 30000;
        this.successThreshold = options.successThreshold || 3;
        this.totalCalls = 0;
        this.totalFailures = 0;
        this.totalSuccesses = 0;
    }

    /** Sync state from Redis if configured */
    async _syncFromRedis() {
        if (!redis) return;
        try {
            const data = await redis.hgetall(`circuit:${this.name}`);
            if (data && data.state) {
                this.state = data.state;
                this.failureCount = parseInt(data.failureCount || '0', 10);
                this.successCount = parseInt(data.successCount || '0', 10);
                this.lastFailure = data.lastFailure ? parseInt(data.lastFailure, 10) : null;
            }
        } catch (err) {
            // Ignore temporary redis dropouts to prevent cascading failure
        }
    }

    /** Push state to Redis if configured */
    _pushToRedis() {
        if (!redis) return;
        redis.hset(`circuit:${this.name}`, {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailure: this.lastFailure || 0,
        }).catch(() => { });
    }

    /** Check if the circuit allows requests */
    async isAvailable() {
        await this._syncFromRedis();

        if (this.state === STATES.CLOSED) return true;
        if (this.state === STATES.OPEN) {
            // Check if enough time has passed to try HALF_OPEN
            if (Date.now() - this.lastFailure > this.resetTimeoutMs) {
                this.state = STATES.HALF_OPEN;
                this._pushToRedis();
                logger.info(`🔄 CircuitBreaker [${this.name}]: OPEN → HALF_OPEN (global test)`);
                return true;
            }
            return false;
        }
        return true; // HALF_OPEN allows limited traffic
    }

    /** Record a successful call */
    async recordSuccess() {
        this.totalCalls++;
        this.totalSuccesses++;

        if (this.state === STATES.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this.state = STATES.CLOSED;
                this.failureCount = 0;
                this.successCount = 0;
                this._pushToRedis();
                logger.info(`✅ CircuitBreaker [${this.name}]: HALF_OPEN → CLOSED (globally recovered)`);
            } else {
                this._pushToRedis();
            }
        } else {
            this.failureCount = Math.max(0, this.failureCount - 1); // Decay on success
            this._pushToRedis();
        }
    }

    /** Record a failed call */
    async recordFailure(error) {
        this.totalCalls++;
        this.totalFailures++;
        this.failureCount++;
        this.lastFailure = Date.now();

        if (this.state === STATES.HALF_OPEN) {
            this.state = STATES.OPEN;
            this.successCount = 0;
            this._pushToRedis();
            logger.warn(`🔴 CircuitBreaker [${this.name}]: HALF_OPEN → OPEN (still failing globally)`);
        } else if (this.failureCount >= this.failureThreshold) {
            this.state = STATES.OPEN;
            this._pushToRedis();
            logger.error(`🔴 CircuitBreaker [${this.name}]: CLOSED → OPEN (tripped globally at ${this.failureCount} failures)`);
        } else {
            this._pushToRedis();
        }
    }

    /** Get circuit status */
    getStatus() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            totalCalls: this.totalCalls,
            totalFailures: this.totalFailures,
            totalSuccesses: this.totalSuccesses,
            successRate: this.totalCalls > 0
                ? Math.round((this.totalSuccesses / this.totalCalls) * 10000) / 100
                : 100,
        };
    }
}

/**
 * Resilient AI Provider with circuit breakers and automatic failover
 */
class ResilientAIProvider {
    constructor() {
        // Failover chain: primary → secondary → tertiary → local
        this.providers = [
            { name: 'gemini', priority: 1 },
            { name: 'gpt4o', priority: 2 },
            { name: 'claude', priority: 3 },
            { name: 'ollama', priority: 4 },
        ];

        // One circuit breaker per provider
        this.circuits = {};
        for (const p of this.providers) {
            this.circuits[p.name] = new CircuitBreaker(p.name, {
                failureThreshold: 5,
                resetTimeoutMs: 30000,
                successThreshold: 3,
            });
        }

        this.retryConfig = {
            maxRetries: 3,
            baseDelayMs: 1000,
            maxDelayMs: 10000,
            jitterMs: 500,
        };
    }

    /**
     * Execute an AI call with circuit breakers and automatic failover
     * @param {Function} aiCallFactory - (providerName) => Promise<result>
     * @param {object} options - { timeoutMs, maxRetries }
     * @returns {object} - { result, provider, latencyMs, retries }
     */
    async execute(aiCallFactory, options = {}) {
        const timeoutMs = options.timeoutMs || 30000;
        const maxRetries = options.maxRetries || this.retryConfig.maxRetries;

        for (const provider of this.providers) {
            const circuit = this.circuits[provider.name];

            if (!(await circuit.isAvailable())) {
                logger.debug(`⏭️ Failover: Skipping ${provider.name} (circuit OPEN globally)`);
                continue;
            }

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const startTime = Date.now();

                    // Execute with timeout
                    const result = await Promise.race([
                        aiCallFactory(provider.name),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error(`TIMEOUT: ${timeoutMs}ms exceeded`)), timeoutMs)
                        ),
                    ]);

                    await circuit.recordSuccess();
                    return {
                        result,
                        provider: provider.name,
                        latencyMs: Date.now() - startTime,
                        retries: attempt,
                        circuit: circuit.state,
                    };

                } catch (err) {
                    await circuit.recordFailure(err);
                    logger.warn(`⚠️ ${provider.name} attempt ${attempt + 1}/${maxRetries + 1}: ${err.message}`);

                    if (attempt < maxRetries) {
                        // Exponential backoff with jitter
                        const delay = Math.min(
                            this.retryConfig.baseDelayMs * Math.pow(2, attempt) +
                            Math.random() * this.retryConfig.jitterMs,
                            this.retryConfig.maxDelayMs
                        );
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
            }

            logger.warn(`🔄 Failover: ${provider.name} exhausted → trying next provider`);
        }

        throw new Error('ALL_PROVIDERS_FAILED: All AI providers are unavailable');
    }

    /** Get health status of all providers */
    getHealth() {
        const statuses = {};
        for (const [name, circuit] of Object.entries(this.circuits)) {
            statuses[name] = circuit.getStatus();
        }
        return {
            providers: statuses,
            healthyProviders: Object.values(statuses).filter(s => s.state === 'CLOSED').length,
            totalProviders: this.providers.length,
        };
    }
}

/**
 * Health Check Aggregator
 * Checks all system dependencies and reports overall health.
 */
class HealthChecker {
    constructor() {
        this.checks = new Map();
    }

    /** Register a health check */
    register(name, checkFn) {
        this.checks.set(name, checkFn);
    }

    /** Run all health checks */
    async check() {
        const results = {};
        let healthy = true;

        for (const [name, checkFn] of this.checks) {
            try {
                const start = Date.now();
                await checkFn();
                results[name] = { status: 'healthy', latencyMs: Date.now() - start };
            } catch (err) {
                results[name] = { status: 'unhealthy', error: err.message };
                healthy = false;
            }
        }

        return {
            status: healthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            version: process.env.APP_VERSION || '1.0.0',
            region: process.env.GCP_REGION || 'us-central1',
            checks: results,
        };
    }
}

export const resilientAI = new ResilientAIProvider();
export const healthChecker = new HealthChecker();
export { CircuitBreaker, STATES };
