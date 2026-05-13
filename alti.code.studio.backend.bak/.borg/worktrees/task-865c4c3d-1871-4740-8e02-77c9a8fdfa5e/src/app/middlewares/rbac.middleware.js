/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import httpStatus from 'http-status';
import { logger } from '../../shared/logger.js';

/**
 * Role-Based Access Control Middleware
 * @param {...string} requiredRoles - Roles allowed to access the route
 */
export const rbac = (...requiredRoles) => {
    return (req, res, next) => {
        // Mock user if request doesn't have one (for now, until Auth is fully integrated)
        // In a real scenario, req.user comes from the Auth middleware (JWT)
        const userRole = req.user?.role || 'ANONYMOUS';

        // For development/testing/demo ease, we might allow 'ADMIN' via a header if no auth middleware is present
        // BUT for "Bank-Grade security", we strictly check permissions.

        // Allow if role matches or if strictly 'ADMIN' is required and user is 'ADMIN'
        if (requiredRoles.includes(userRole) || userRole === 'ADMIN') {
            return next();
        }

        logger.warn(`⛔ [RBAC] Access DENIED for user ${req.user?.id || 'unknown'} (Role: ${userRole}) to ${req.originalUrl}`);

        return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'Forbidden: Insufficient Permissions',
        });
    };
};
