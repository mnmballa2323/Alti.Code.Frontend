/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Audit Logging Middleware
 * Automatically records HTTP requests to the Immutable Audit Ledger.
 */

import { auditLogService } from '../modules/security/auditLog.service.js';

export const auditMiddleware = (actionName = 'API_REQUEST') => {
    return (req, res, next) => {
        // We want to log *after* the request finishes so we know the status.
        res.on('finish', () => {
            // Skip logging very noisy endpoints if needed (like health checks)
            if (req.originalUrl.includes('/health') || req.originalUrl.includes('/ready')) {
                return;
            }

            const status = res.statusCode >= 400 ? 'FAILED' : 'SUCCESS';
            const userId = req.user?.id || req.user?.sub;
            const userEmail = req.user?.email;
            const tenantId = req.user?.tenantId || req.tenant?.id;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            auditLogService.logAction({
                tenantId,
                userId,
                userEmail,
                action: actionName,
                resource: `${req.method} ${req.originalUrl}`,
                ipAddress,
                userAgent: req.get('User-Agent'),
                status,
                metadata: {
                    statusCode: res.statusCode,
                    query: req.query
                }
            });
        });

        next();
    };
};
