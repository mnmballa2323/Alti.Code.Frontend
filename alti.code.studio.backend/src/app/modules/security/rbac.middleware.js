import { logger } from '../../../shared/logger.js';

/**
 * Enterprise Role-Based Access Control (RBAC) Middleware.
 * Fortune 100 Compliance: Enforces strict Least-Privilege access to the Swarm.
 * Prevents junior developers or external contractors from triggering 
 * destructive agentic workflows or accessing high-tier models.
 */
class RBACService {
    constructor() {
        // In a true Fortune 100 setup, this syncs with Google Workspace Cloud Identity.
        // For demonstration, we use a static policy map.
        this.iamPolicies = {
            'mmeram@chamber.law': ['ADMIN', 'ARCHITECT', 'DEVELOPER'],
            'dev@alti.local': ['ADMIN', 'ARCHITECT', 'DEVELOPER'],
            'contractor@vendor.com': ['DEVELOPER']
        };
    }

    /**
     * Middleware: Requires the user to possess a specific IAM role.
     */
    requireRole(requiredRole) {
        return (req, res, next) => {
            const userEmail = req.user?.email;
            
            if (!userEmail) {
                logger.warn(`🛑 [RBAC] Access Denied: Unauthenticated request attempting to breach ${req.originalUrl}`);
                return res.status(401).json({ error: 'Unauthorized', message: 'Missing IAP Identity.' });
            }

            const userRoles = this.iamPolicies[userEmail] || [];

            if (!userRoles.includes(requiredRole) && !userRoles.includes('ADMIN')) {
                logger.error(`🚨 [RBAC] Access Denied: ${userEmail} attempted to execute a [${requiredRole}] operation without privileges.`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Enterprise Security Violation: You lack the [${requiredRole}] IAM role required for this action.`
                });
            }

            logger.info(`🔐 [RBAC] Access Granted: ${userEmail} authorized as [${requiredRole}].`);
            next();
        };
    }

    /**
     * Middleware: Automatically determines the required role based on the requested model tier.
     * e.g., gemini-3.1-pro requires ARCHITECT, while local models only require DEVELOPER.
     */
    enforceModelTierPolicy() {
        return (req, res, next) => {
            const requestedModel = req.body?.modelTier || req.body?.model || 'gemini-3.1-flash';
            const userEmail = req.user?.email || 'unknown';
            const userRoles = this.iamPolicies[userEmail] || [];

            // High-cost, highly intelligent models require architectural clearance
            if (requestedModel.includes('pro') && !userRoles.includes('ARCHITECT') && !userRoles.includes('ADMIN')) {
                logger.warn(`💸 [RBAC/FinOps] Access Denied: ${userEmail} attempted to use ${requestedModel} without budget/clearance.`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `FinOps Policy: You are not authorized to invoke Tier-1 Cloud Models (${requestedModel}). Please use local edge models or request ARCHITECT clearance.`
                });
            }

            next();
        };
    }
}

export const rbacService = new RBACService();
