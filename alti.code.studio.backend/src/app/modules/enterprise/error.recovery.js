/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * ERROR RECOVERY PIPELINE (Phase 41)
 * 
 * Comprehensive error handling for enterprise reliability:
 *   - Dead Letter Queue (DLQ) for failed dispatches
 *   - Retry policies (exponential backoff, jitter, max retries)
 *   - Request schema validation middleware
 *   - Error classification (transient vs permanent)
 *   - Recovery strategies per error type
 *   - Error budget tracking (SLO enforcement)
 */

import { logger } from '../../../shared/logger.js';

// ═══════════════════════════════════════════════
// Dead Letter Queue
// ═══════════════════════════════════════════════

class DeadLetterQueue {
    constructor() {
        this.queue = [];
        this.maxSize = 10000;
        this.stats = { totalEnqueued: 0, totalReprocessed: 0, totalDropped: 0 };
    }

    /**
     * Enqueue a failed dispatch for later retry/analysis.
     */
    enqueue(failedJob) {
        const entry = {
            id: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            job: failedJob.job,
            error: {
                message: failedJob.error?.message || 'Unknown error',
                code: failedJob.error?.code,
                type: this._classifyError(failedJob.error),
            },
            attempts: failedJob.attempts || 1,
            firstFailedAt: failedJob.firstFailedAt || new Date().toISOString(),
            lastFailedAt: new Date().toISOString(),
            tenantId: failedJob.tenantId || 'unknown',
            agentName: failedJob.agentName || 'unknown',
            status: 'QUEUED',
        };

        if (this.queue.length >= this.maxSize) {
            this.queue.shift(); // Drop oldest
            this.stats.totalDropped++;
        }

        this.queue.push(entry);
        this.stats.totalEnqueued++;
        logger.warn(`📬 DLQ: Enqueued ${entry.id} (agent: ${entry.agentName}, attempts: ${entry.attempts})`);
        return entry;
    }

    /**
     * Dequeue items for reprocessing.
     */
    dequeue(limit = 10, filter = {}) {
        let items = this.queue.filter(e => e.status === 'QUEUED');

        if (filter.tenantId) items = items.filter(e => e.tenantId === filter.tenantId);
        if (filter.agentName) items = items.filter(e => e.agentName === filter.agentName);
        if (filter.errorType) items = items.filter(e => e.error.type === filter.errorType);

        // Only dequeue transient errors (permanent errors stay for analysis)
        items = items.filter(e => e.error.type === 'TRANSIENT');

        const batch = items.slice(0, limit);
        batch.forEach(item => {
            item.status = 'REPROCESSING';
            this.stats.totalReprocessed++;
        });

        return batch;
    }

    /**
     * Mark an item as resolved.
     */
    resolve(dlqId) {
        const entry = this.queue.find(e => e.id === dlqId);
        if (entry) entry.status = 'RESOLVED';
        return entry;
    }

    /**
     * Get queue contents.
     */
    list(filter = {}) {
        let items = [...this.queue];

        if (filter.status) items = items.filter(e => e.status === filter.status);
        if (filter.tenantId) items = items.filter(e => e.tenantId === filter.tenantId);
        if (filter.limit) items = items.slice(0, filter.limit);

        return items;
    }

    /**
     * Classify error type.
     */
    _classifyError(error) {
        if (!error) return 'UNKNOWN';
        const msg = (error.message || '').toLowerCase();

        // Transient (can retry)
        if (msg.includes('timeout')) return 'TRANSIENT';
        if (msg.includes('rate limit')) return 'TRANSIENT';
        if (msg.includes('503')) return 'TRANSIENT';
        if (msg.includes('429')) return 'TRANSIENT';
        if (msg.includes('econnreset')) return 'TRANSIENT';
        if (msg.includes('econnrefused')) return 'TRANSIENT';
        if (msg.includes('network')) return 'TRANSIENT';
        if (msg.includes('temporarily')) return 'TRANSIENT';

        // Permanent (don't retry)
        if (msg.includes('unauthorized')) return 'PERMANENT';
        if (msg.includes('forbidden')) return 'PERMANENT';
        if (msg.includes('not found')) return 'PERMANENT';
        if (msg.includes('validation')) return 'PERMANENT';
        if (msg.includes('invalid')) return 'PERMANENT';
        if (msg.includes('schema')) return 'PERMANENT';

        return 'UNKNOWN';
    }

    getStats() {
        const byType = {};
        const byStatus = {};
        for (const entry of this.queue) {
            byType[entry.error.type] = (byType[entry.error.type] || 0) + 1;
            byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
        }

        return {
            queueSize: this.queue.length,
            maxSize: this.maxSize,
            totalEnqueued: this.stats.totalEnqueued,
            totalReprocessed: this.stats.totalReprocessed,
            totalDropped: this.stats.totalDropped,
            byType,
            byStatus,
        };
    }
}

// ═══════════════════════════════════════════════
// Retry Policy Engine
// ═══════════════════════════════════════════════

class RetryPolicy {
    constructor() {
        this.defaultPolicy = {
            maxRetries: 3,
            baseDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
            jitter: true,
        };

        this.policies = new Map();
        this._registerDefaults();
    }

    _registerDefaults() {
        this.policies.set('ai-provider', {
            maxRetries: 4,
            baseDelayMs: 2000,
            maxDelayMs: 60000,
            backoffMultiplier: 2,
            jitter: true,
        });

        this.policies.set('database', {
            maxRetries: 5,
            baseDelayMs: 500,
            maxDelayMs: 15000,
            backoffMultiplier: 1.5,
            jitter: true,
        });

        this.policies.set('webhook', {
            maxRetries: 3,
            baseDelayMs: 5000,
            maxDelayMs: 300000, // 5 minutes
            backoffMultiplier: 3,
            jitter: false,
        });

        this.policies.set('agent-dispatch', {
            maxRetries: 2,
            baseDelayMs: 1000,
            maxDelayMs: 10000,
            backoffMultiplier: 2,
            jitter: true,
        });
    }

    /**
     * Execute a function with retry policy.
     */
    async execute(fn, policyName = 'default', context = {}) {
        const policy = this.policies.get(policyName) || this.defaultPolicy;
        let lastError = null;
        let attempt = 0;

        while (attempt <= policy.maxRetries) {
            try {
                const result = await fn(attempt);
                return { success: true, result, attempts: attempt + 1 };
            } catch (error) {
                lastError = error;
                attempt++;

                if (attempt > policy.maxRetries) break;

                // Calculate delay with exponential backoff
                let delay = Math.min(
                    policy.baseDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1),
                    policy.maxDelayMs
                );

                // Add jitter
                if (policy.jitter) {
                    delay = delay * (0.5 + Math.random() * 0.5);
                }

                logger.warn(`🔄 Retry ${attempt}/${policy.maxRetries} for ${policyName}: ${error.message} (delay: ${Math.round(delay)}ms)`);
                await new Promise(r => setTimeout(r, delay));
            }
        }

        return {
            success: false,
            error: lastError,
            attempts: attempt,
            exhausted: true,
        };
    }

    getPolicy(name) {
        return this.policies.get(name) || this.defaultPolicy;
    }

    listPolicies() {
        const result = { default: this.defaultPolicy };
        for (const [name, policy] of this.policies) {
            result[name] = policy;
        }
        return result;
    }
}

// ═══════════════════════════════════════════════
// Request Schema Validator
// ═══════════════════════════════════════════════

class SchemaValidator {
    constructor() {
        this.schemas = new Map();
        this._registerDefaults();
    }

    _registerDefaults() {
        this.register('dispatch', {
            required: ['agentName', 'task'],
            properties: {
                agentName: { type: 'string', minLength: 1, maxLength: 100 },
                task: { type: 'string', minLength: 1, maxLength: 50000 },
                tenantId: { type: 'string', maxLength: 100 },
                mode: { type: 'string', enum: ['AUTONOMOUS', 'SUPERVISED', 'REVIEW'] },
                priority: { type: 'number', min: 1, max: 10 },
                squad: { type: 'string', maxLength: 50 },
            },
        });

        this.register('tenant', {
            required: ['name', 'plan'],
            properties: {
                name: { type: 'string', minLength: 2, maxLength: 200 },
                plan: { type: 'string', enum: ['starter', 'professional', 'enterprise', 'sp500'] },
                region: { type: 'string', enum: ['us-central1', 'europe-west1', 'asia-east1', 'me-west1'] },
                complianceProfile: { type: 'string', maxLength: 50 },
            },
        });

        this.register('webhook', {
            required: ['url', 'events'],
            properties: {
                url: { type: 'string', pattern: /^https:\/\// },
                events: { type: 'array', minItems: 1 },
                secret: { type: 'string', minLength: 16 },
            },
        });

        this.register('apiKey', {
            required: ['name'],
            properties: {
                name: { type: 'string', minLength: 1, maxLength: 100 },
                scopes: { type: 'array' },
                expiresIn: { type: 'number', min: 3600000 },
                environment: { type: 'string', enum: ['production', 'staging', 'development'] },
            },
        });
    }

    register(name, schema) {
        this.schemas.set(name, schema);
    }

    validate(schemaName, data) {
        const schema = this.schemas.get(schemaName);
        if (!schema) return { valid: true, warnings: [`Schema '${schemaName}' not found, skipping`] };

        const errors = [];

        // Check required fields
        if (schema.required) {
            for (const field of schema.required) {
                if (data[field] === undefined || data[field] === null || data[field] === '') {
                    errors.push({ field, message: `'${field}' is required` });
                }
            }
        }

        // Validate properties
        if (schema.properties) {
            for (const [field, rules] of Object.entries(schema.properties)) {
                const value = data[field];
                if (value === undefined || value === null) continue;

                if (rules.type === 'string' && typeof value !== 'string') {
                    errors.push({ field, message: `'${field}' must be a string` });
                }
                if (rules.type === 'number' && typeof value !== 'number') {
                    errors.push({ field, message: `'${field}' must be a number` });
                }
                if (rules.type === 'array' && !Array.isArray(value)) {
                    errors.push({ field, message: `'${field}' must be an array` });
                }
                if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                    errors.push({ field, message: `'${field}' must be at least ${rules.minLength} characters` });
                }
                if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                    errors.push({ field, message: `'${field}' must be at most ${rules.maxLength} characters` });
                }
                if (rules.min && typeof value === 'number' && value < rules.min) {
                    errors.push({ field, message: `'${field}' must be at least ${rules.min}` });
                }
                if (rules.max && typeof value === 'number' && value > rules.max) {
                    errors.push({ field, message: `'${field}' must be at most ${rules.max}` });
                }
                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push({ field, message: `'${field}' must be one of: ${rules.enum.join(', ')}` });
                }
                if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                    errors.push({ field, message: `'${field}' format is invalid` });
                }
                if (rules.minItems && Array.isArray(value) && value.length < rules.minItems) {
                    errors.push({ field, message: `'${field}' must have at least ${rules.minItems} items` });
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            schema: schemaName,
        };
    }

    /**
     * Express validation middleware.
     */
    middleware(schemaName) {
        return (req, res, next) => {
            const result = this.validate(schemaName, req.body);
            if (!result.valid) {
                return res.status(400).json({
                    error: 'Validation failed',
                    schema: schemaName,
                    details: result.errors,
                });
            }
            next();
        };
    }

    listSchemas() {
        const result = {};
        for (const [name, schema] of this.schemas) {
            result[name] = {
                required: schema.required,
                properties: Object.keys(schema.properties || {}),
            };
        }
        return result;
    }
}

// ═══════════════════════════════════════════════
// Error Budget Tracker (SLO enforcement)
// ═══════════════════════════════════════════════

class ErrorBudgetTracker {
    constructor() {
        this.windows = new Map(); // period → { total, errors }
        this.sloTarget = 0.9999; // 99.99%
        this.windowDuration = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    record(success) {
        const period = this._currentPeriod();
        let window = this.windows.get(period);
        if (!window) {
            window = { total: 0, errors: 0, startedAt: new Date().toISOString() };
            this.windows.set(period, window);
        }
        window.total++;
        if (!success) window.errors++;
    }

    getBudget() {
        const period = this._currentPeriod();
        const window = this.windows.get(period) || { total: 0, errors: 0 };

        const errorBudget = Math.max(1, Math.ceil(window.total * (1 - this.sloTarget)));
        const errorsConsumed = window.errors;
        const remaining = Math.max(0, errorBudget - errorsConsumed);
        const percentUsed = errorBudget > 0 ? Math.round(errorsConsumed / errorBudget * 100) : 0;

        return {
            sloTarget: `${(this.sloTarget * 100).toFixed(2)}%`,
            period: period,
            totalRequests: window.total,
            totalErrors: window.errors,
            errorBudget,
            errorsConsumed,
            budgetRemaining: remaining,
            budgetUsedPercent: percentUsed,
            status: percentUsed > 80 ? 'CRITICAL' : percentUsed > 50 ? 'WARNING' : 'HEALTHY',
        };
    }

    _currentPeriod() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
}

export const dlq = new DeadLetterQueue();
export const retryPolicy = new RetryPolicy();
export const schemaValidator = new SchemaValidator();
export const errorBudget = new ErrorBudgetTracker();
