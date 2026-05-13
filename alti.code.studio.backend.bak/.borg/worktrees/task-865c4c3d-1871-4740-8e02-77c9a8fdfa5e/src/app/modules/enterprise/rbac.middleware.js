/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * RBAC MIDDLEWARE — Role-Based Access Control
 * 
 * Express middleware that:
 *   1. Extracts Bearer token from Authorization header
 *   2. Validates via Google Cloud Identity Platform
 *   3. Injects tenant context into req.tenant
 *   4. Checks permissions against the role matrix
 *   5. Enforces data residency (GCP region)
 * 
 * Usage:
 *   router.post('/agents/dispatch', rbac('agents:dispatch'), handler);
 *   router.get('/audit', rbac('audit:read'), handler);
 */

import { enterpriseSSO, ROLES, PERMISSIONS, GCP_REGIONS } from './sso.provider.js';
import { tenantService } from './tenant.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * RBAC middleware factory
 * @param {...string} requiredPermissions - One or more permissions required
 * @returns {Function} Express middleware
 */
export function rbac(...requiredPermissions) {
    return async (req, res, next) => {
        try {
            // 1. Extract token
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                return res.status(401).json({
                    error: 'UNAUTHORIZED',
                    message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
                });
            }

            const token = authHeader.substring(7);

            // 2. Validate token and extract identity
            const identity = await enterpriseSSO.validateToken(token);

            // 3. Resolve tenant
            const tenant = await tenantService.resolve(identity.tenantId);
            if (!tenant) {
                return res.status(403).json({
                    error: 'TENANT_NOT_FOUND',
                    message: `Tenant "${identity.tenantId}" is not registered.`,
                });
            }

            // 4. Check tenant is active
            if (tenant.status !== 'active') {
                return res.status(403).json({
                    error: 'TENANT_SUSPENDED',
                    message: `Tenant "${tenant.name}" is ${tenant.status}. Contact support.`,
                });
            }

            // 5. Check permissions
            if (requiredPermissions.length > 0) {
                const hasWildcard = identity.permissions.includes('*');
                if (!hasWildcard) {
                    const missing = requiredPermissions.filter(p => !identity.permissions.includes(p));
                    if (missing.length > 0) {
                        logger.warn(`🚫 RBAC: ${identity.email} (${identity.role}) denied [${missing.join(', ')}]`);
                        return res.status(403).json({
                            error: 'FORBIDDEN',
                            message: `Role "${identity.role}" lacks permissions: ${missing.join(', ')}`,
                            required: missing,
                        });
                    }
                }
            }

            // 6. Inject tenant context into request
            req.identity = identity;
            req.tenant = {
                id: tenant.id,
                name: tenant.name,
                plan: tenant.plan,
                region: tenant.region,
                quotas: tenant.quotas,
                compliance: tenant.compliance,
            };
            req.tenantId = tenant.id;

            // 7. Log access for audit trail
            logger.debug(`✅ RBAC: ${identity.email} (${identity.role}) → ${req.method} ${req.path}`);

            next();
        } catch (err) {
            if (err.message.startsWith('AUTH_TOKEN_EXPIRED')) {
                return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Token has expired. Please re-authenticate.' });
            }
            if (err.message.startsWith('AUTH_')) {
                return res.status(401).json({ error: 'AUTH_FAILED', message: err.message });
            }
            logger.error(`❌ RBAC Error: ${err.message}`);
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Authentication service unavailable.' });
        }
    };
}

/**
 * Data residency enforcement middleware
 * Ensures requests are routed to the correct GCP region based on tenant config.
 */
export function enforceResidency() {
    return (req, res, next) => {
        if (!req.tenant) return next();

        const tenantRegion = req.tenant.region;
        const serverRegion = process.env.GCP_REGION || 'us-central1';

        // If tenant's data must stay in a specific region and this server isn't in it
        if (tenantRegion && !tenantRegion.startsWith(serverRegion.split('-')[0])) {
            logger.warn(`🌍 Data Residency: Tenant ${req.tenant.name} requires ${tenantRegion}, server is ${serverRegion}`);
            return res.status(421).json({
                error: 'DATA_RESIDENCY_VIOLATION',
                message: `Tenant data must be processed in region "${tenantRegion}". This server is in "${serverRegion}".`,
                redirectTo: `https://${tenantRegion}.alti.code.studio`,
            });
        }
        next();
    };
}

/**
 * Rate limiting middleware (per-tenant)
 */
export function rateLimiter() {
    const tenantCounters = new Map();

    return (req, res, next) => {
        if (!req.tenant) return next();

        const key = req.tenant.id;
        const now = Date.now();
        const windowMs = 60000; // 1 minute window
        const maxRequests = req.tenant.quotas?.requestsPerMinute || 1000;

        if (!tenantCounters.has(key)) {
            tenantCounters.set(key, { count: 0, resetAt: now + windowMs });
        }

        const counter = tenantCounters.get(key);
        if (now > counter.resetAt) {
            counter.count = 0;
            counter.resetAt = now + windowMs;
        }

        counter.count++;

        // Set rate limit headers
        res.set('X-RateLimit-Limit', String(maxRequests));
        res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - counter.count)));
        res.set('X-RateLimit-Reset', String(Math.ceil(counter.resetAt / 1000)));

        if (counter.count > maxRequests) {
            logger.warn(`⚠️ Rate Limit: Tenant ${req.tenant.name} exceeded ${maxRequests} req/min`);
            return res.status(429).json({
                error: 'RATE_LIMIT_EXCEEDED',
                message: `Tenant quota exceeded: ${maxRequests} requests per minute.`,
                retryAfter: Math.ceil((counter.resetAt - now) / 1000),
            });
        }

        next();
    };
}
