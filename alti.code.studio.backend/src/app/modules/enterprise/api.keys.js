/**
 * Copyright (c) 2024 Inso Code
 * 
 * API KEY MANAGEMENT & RATE LIMITING (Phase 39)
 * 
 * Enterprise API key infrastructure:
 *   - HMAC-SHA256 key generation (scoped, expirable, revocable)
 *   - Key rotation with zero-downtime (dual-key overlap window)
 *   - Per-tenant rate limiting tiers tied to plan
 *   - Usage tracking per key (requests, tokens, last used)
 *   - Key audit trail (created, rotated, revoked events)
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Rate Limit Tiers (per tenant plan)
// ═══════════════════════════════════════════════

const RATE_TIERS = {
    starter: { requestsPerMinute: 60, requestsPerHour: 1_000, requestsPerDay: 10_000, tokensPerDay: 500_000, concurrentJobs: 5 },
    professional: { requestsPerMinute: 300, requestsPerHour: 10_000, requestsPerDay: 100_000, tokensPerDay: 5_000_000, concurrentJobs: 25 },
    enterprise: { requestsPerMinute: 1_000, requestsPerHour: 50_000, requestsPerDay: 500_000, tokensPerDay: 50_000_000, concurrentJobs: 100 },
    sp500: { requestsPerMinute: 5_000, requestsPerHour: 250_000, requestsPerDay: 2_500_000, tokensPerDay: 500_000_000, concurrentJobs: 500 },
};

// ═══════════════════════════════════════════════
// API Key Manager
// ═══════════════════════════════════════════════

class ApiKeyManager {
    constructor() {
        this.keys = new Map();          // keyHash → keyData
        this.tenantKeys = new Map();    // tenantId → [keyHashes]
        this.revokedKeys = new Set();
        this.auditLog = [];
        this.signingSecret = crypto.randomBytes(32).toString('hex');
    }

    // ── Key Generation ──

    generateKey(tenantId, options = {}) {
        const {
            name = 'default',
            scopes = ['agents:dispatch', 'agents:list', 'costs:read'],
            expiresIn = 90 * 24 * 60 * 60 * 1000, // 90 days default
            environment = 'production',
        } = options;

        // Generate key: prefix + HMAC payload
        const prefix = environment === 'production' ? 'acs_live' : 'acs_test';
        const payload = crypto.randomBytes(32).toString('hex');
        const rawKey = `${prefix}_${payload}`;
        const keyHash = this._hash(rawKey);

        const keyData = {
            id: `key_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            tenantId,
            name,
            prefix,
            keyHash,
            scopes,
            environment,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + expiresIn).toISOString(),
            lastUsedAt: null,
            usage: { requests: 0, tokens: 0 },
            status: 'ACTIVE',
            rotatedFrom: null,
        };

        this.keys.set(keyHash, keyData);

        // Track per tenant
        if (!this.tenantKeys.has(tenantId)) {
            this.tenantKeys.set(tenantId, []);
        }
        this.tenantKeys.get(tenantId).push(keyHash);

        this._audit('KEY_CREATED', tenantId, { keyId: keyData.id, name, scopes, expiresAt: keyData.expiresAt });

        logger.info(`🔑 API key created: ${keyData.id} for tenant ${tenantId} [${prefix}]`);

        // Return the raw key only once — never stored
        return {
            apiKey: rawKey,
            keyId: keyData.id,
            prefix,
            scopes,
            expiresAt: keyData.expiresAt,
            warning: 'Store this key securely. It will not be shown again.',
        };
    }

    // ── Key Validation ──

    validateKey(rawKey) {
        if (!rawKey || typeof rawKey !== 'string') {
            return { valid: false, reason: 'INVALID_KEY_FORMAT' };
        }
        const keyHash = this._hash(rawKey);
        const keyData = this.keys.get(keyHash);

        if (!keyData) {
            return { valid: false, reason: 'KEY_NOT_FOUND' };
        }

        if (this.revokedKeys.has(keyHash)) {
            return { valid: false, reason: 'KEY_REVOKED' };
        }

        if (keyData.status !== 'ACTIVE' && keyData.status !== 'ROTATING') {
            return { valid: false, reason: `KEY_${keyData.status}` };
        }

        if (new Date(keyData.expiresAt) < new Date()) {
            keyData.status = 'EXPIRED';
            return { valid: false, reason: 'KEY_EXPIRED' };
        }

        // Update usage
        keyData.lastUsedAt = new Date().toISOString();
        keyData.usage.requests++;

        return {
            valid: true,
            tenantId: keyData.tenantId,
            scopes: keyData.scopes,
            keyId: keyData.id,
            environment: keyData.environment,
        };
    }

    // ── Key Rotation (zero-downtime) ──

    rotateKey(tenantId, oldKeyId, options = {}) {
        // Find the old key
        const oldEntry = [...this.keys.values()].find(k => k.id === oldKeyId && k.tenantId === tenantId);
        if (!oldEntry) throw new Error(`Key not found: ${oldKeyId}`);

        // Generate new key with same scopes
        const newKeyResult = this.generateKey(tenantId, {
            name: `${oldEntry.name} (rotated)`,
            scopes: oldEntry.scopes,
            environment: oldEntry.environment,
            ...options,
        });

        // Mark old key with grace period (default 24h)
        const gracePeriod = options.gracePeriodMs || 24 * 60 * 60 * 1000;
        oldEntry.status = 'ROTATING';
        oldEntry.expiresAt = new Date(Date.now() + gracePeriod).toISOString();

        // Link rotation
        const newKeyHash = this._hash(newKeyResult.apiKey);
        const newKeyData = this.keys.get(newKeyHash);
        if (newKeyData) newKeyData.rotatedFrom = oldKeyId;

        this._audit('KEY_ROTATED', tenantId, {
            oldKeyId,
            newKeyId: newKeyResult.keyId,
            gracePeriodMs: gracePeriod,
        });

        logger.info(`🔄 Key rotated: ${oldKeyId} → ${newKeyResult.keyId} (grace: ${gracePeriod}ms)`);

        return {
            newKey: newKeyResult,
            oldKeyExpiresAt: oldEntry.expiresAt,
            gracePeriodMs: gracePeriod,
        };
    }

    // ── Key Revocation ──

    revokeKey(tenantId, keyId) {
        const entry = [...this.keys.values()].find(k => k.id === keyId && k.tenantId === tenantId);
        if (!entry) throw new Error(`Key not found: ${keyId}`);

        entry.status = 'REVOKED';
        this.revokedKeys.add(entry.keyHash);

        this._audit('KEY_REVOKED', tenantId, { keyId });
        logger.warn(`🚫 Key revoked: ${keyId} for tenant ${tenantId}`);

        return { revoked: true, keyId };
    }

    // ── List Keys (redacted) ──

    listKeys(tenantId) {
        const hashes = this.tenantKeys.get(tenantId) || [];
        return hashes.map(hash => {
            const k = this.keys.get(hash);
            return {
                keyId: k.id,
                name: k.name,
                prefix: k.prefix,
                scopes: k.scopes,
                status: k.status,
                createdAt: k.createdAt,
                expiresAt: k.expiresAt,
                lastUsedAt: k.lastUsedAt,
                usage: { ...k.usage },
            };
        });
    }

    // ── Stats ──

    getStats() {
        const allKeys = [...this.keys.values()];
        return {
            totalKeys: allKeys.length,
            activeKeys: allKeys.filter(k => k.status === 'ACTIVE').length,
            expiredKeys: allKeys.filter(k => k.status === 'EXPIRED').length,
            revokedKeys: this.revokedKeys.size,
            rotatingKeys: allKeys.filter(k => k.status === 'ROTATING').length,
            tenantsWithKeys: this.tenantKeys.size,
        };
    }

    // ── Internal ──

    _hash(key) {
        return crypto.createHmac('sha256', this.signingSecret).update(key).digest('hex');
    }

    _audit(action, tenantId, details) {
        this.auditLog.push({
            action,
            tenantId,
            details,
            timestamp: new Date().toISOString(),
        });
        if (this.auditLog.length > 5000) {
            this.auditLog = this.auditLog.slice(-2500);
        }
    }
}

// ═══════════════════════════════════════════════
// Rate Limiter (per-tenant tier)
// ═══════════════════════════════════════════════

class TenantRateLimiter {
    constructor() {
        this.windows = new Map();  // `${tenantId}:${windowKey}` → { count, resetAt }
    }

    /**
     * Check if a request is within rate limits for the tenant's plan.
     * @returns {{ allowed: boolean, remaining: number, resetAt: string, tier: string }}
     */
    check(tenantId, plan = 'starter') {
        const tier = RATE_TIERS[plan] || RATE_TIERS.starter;
        const now = Date.now();
        const minuteKey = `${tenantId}:minute:${Math.floor(now / 60000)}`;

        // Get or create window
        let window = this.windows.get(minuteKey);
        if (!window || now > window.resetAt) {
            window = { count: 0, resetAt: now + 60000 };
            this.windows.set(minuteKey, window);
        }

        window.count++;
        const allowed = window.count <= tier.requestsPerMinute;
        const remaining = Math.max(0, tier.requestsPerMinute - window.count);

        // Garbage collect old windows probabilistically (5% chance) to prevent O(N) event loop blocking under heavy load
        if (this.windows.size > 5000 && Math.random() < 0.05) {
            for (const [key, w] of this.windows) {
                if (now > w.resetAt) this.windows.delete(key);
            }
        }

        return {
            allowed,
            remaining,
            limit: tier.requestsPerMinute,
            resetAt: new Date(window.resetAt).toISOString(),
            tier: plan,
            headers: {
                'X-RateLimit-Limit': tier.requestsPerMinute,
                'X-RateLimit-Remaining': remaining,
                'X-RateLimit-Reset': Math.ceil(window.resetAt / 1000),
            },
        };
    }

    /**
     * Express middleware factory.
     */
    middleware() {
        return (req, res, next) => {
            const tenantId = req.tenantId || 'anonymous';
            const plan = req.tenantPlan || 'starter';
            const result = this.check(tenantId, plan);

            // Set rate limit headers
            res.set(result.headers);

            if (!result.allowed) {
                return res.status(429).json({
                    error: 'Rate limit exceeded',
                    retryAfter: result.resetAt,
                    tier: result.tier,
                    limit: result.limit,
                });
            }

            next();
        };
    }

    getTiers() {
        return { ...RATE_TIERS };
    }

    getStats() {
        return {
            activeWindows: this.windows.size,
            tiers: Object.keys(RATE_TIERS),
        };
    }
}

export const apiKeyManager = new ApiKeyManager();
export const rateLimiter = new TenantRateLimiter();
export { RATE_TIERS };
