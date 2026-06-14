/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Attribute-Based Access Control (ABAC) Middleware.
 * Beyond simple RBAC (Role-Based Access Control), ABAC evaluates attributes 
 * like IP address, clearance level, and context to determine access.
 */

import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError.js';
import { logger } from '../../shared/logger.js';
import { prisma } from '../../config/prisma.js';
import ip from 'ip';
import { siemService } from '../modules/security/siem.service.js';

export const abacMiddleware = (requiredClearanceLevel = 1) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(); // Skip if unauthenticated (should be caught by auth middleware anyway)
            }

            // Fetch ABAC attributes from database
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { clearanceLevel: true, allowedIps: true, email: true, tenantId: true }
            });

            if (!user) return next();

            // 1. Enforce Clearance Level
            if (user.clearanceLevel < requiredClearanceLevel) {
                logger.warn(`[ABAC] Clearance check failed for ${user.email}. Has: ${user.clearanceLevel}, Required: ${requiredClearanceLevel}`);
                
                if (user.tenantId) {
                    siemService.dispatchEvent(user.tenantId, 'ABAC_CLEARANCE_DENIED', {
                        userId,
                        userEmail: user.email,
                        currentClearance: user.clearanceLevel,
                        requiredClearance: requiredClearanceLevel,
                        path: req.originalUrl
                    });
                }

                throw new ApiError(httpStatus.FORBIDDEN, `Access Denied: Insufficient Clearance Level. Requires Level ${requiredClearanceLevel}.`);
            }

            // 2. Enforce IP Whitelist (if strictly defined for this user)
            if (user.allowedIps && user.allowedIps.length > 0) {
                const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                
                // Fast-path bypass for localhost in dev
                if (process.env.NODE_ENV !== 'production' && (clientIp === '::1' || clientIp === '127.0.0.1')) {
                    return next();
                }

                let isAllowed = false;
                for (const allowedCidr of user.allowedIps) {
                    try {
                        if (ip.cidrSubnet(allowedCidr).contains(clientIp)) {
                            isAllowed = true;
                            break;
                        }
                    } catch (e) {
                        // If it's not a valid CIDR, check direct IP match
                        if (allowedCidr === clientIp) {
                            isAllowed = true;
                            break;
                        }
                    }
                }

                if (!isAllowed) {
                    logger.warn(`[ABAC] IP Whitelist violation for ${user.email}. Attempted from ${clientIp}`);
                    
                    if (user.tenantId) {
                        siemService.dispatchEvent(user.tenantId, 'ABAC_IP_DENIED', {
                            userId,
                            userEmail: user.email,
                            ipAttempted: clientIp,
                            path: req.originalUrl
                        });
                    }

                    throw new ApiError(httpStatus.FORBIDDEN, `Access Denied: Your IP address (${clientIp}) is not whitelisted for this account.`);
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
