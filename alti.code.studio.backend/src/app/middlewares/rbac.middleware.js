/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { logger } from '../../shared/logger.js';
import config from '../../../config/index.js';

/**
 * Role-Based Access Control Middleware
 * @param {...string} requiredRoles - Roles allowed to access the route
 */
export const rbac = (...requiredRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            // In dev mode without auth middleware we might have anonymous
            if (config.env !== 'production') {
                const devRole = req.headers['x-dev-role'] || 'ANONYMOUS';
                if (requiredRoles.includes(devRole) || devRole === 'ADMIN') {
                    return next();
                }
            }
            logger.warn(`⛔ [RBAC] Access DENIED - Missing User Context`);
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized: Missing Auth Context',
            });
        }

        const userRole = user.role;

        // Allow if role matches (case-insensitive check to be robust) or if user is owner/super_admin
        const isAllowed = requiredRoles.some(r => r.toLowerCase() === userRole.toLowerCase()) || 
                          userRole.toLowerCase() === 'owner' || 
                          userRole.toLowerCase() === 'super_admin';

        if (isAllowed) {
            return next();
        }

        logger.warn(`⛔ [RBAC] Access DENIED for user ${user.userId || 'unknown'} (Role: ${userRole}) to ${req.originalUrl}`);

        return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: 'Forbidden: Insufficient Permissions',
        });
    };
};
