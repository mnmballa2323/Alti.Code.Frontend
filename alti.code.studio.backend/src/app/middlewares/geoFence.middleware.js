/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Geo-Fencing Middleware for Data Sovereignty (FedRAMP / GDPR).
 * Ensures that API requests originating from an IP address outside
 * the tenant's authorized data region are hard-blocked.
 */

import geoip from 'geoip-lite'; // Assume we have a geoip library for location lookup
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import { prisma } from '../../../config/prisma.js';

export const geoFenceMiddleware = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return next(); // Skip if user is not bound to a tenant
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { dataRegion: true, name: true }
        });

        if (!tenant) return next();

        // Bypass in dev mode unless strictly testing
        if (process.env.NODE_ENV !== 'production' && process.env.STRICT_GEO_FENCE !== 'true') {
            return next();
        }

        // Get client IP
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // Lookup geolocation
        const geo = geoip.lookup(clientIp);
        const requestCountry = geo ? geo.country : 'UNKNOWN';

        // Very basic mapping of dataRegion to expected countries (in reality this uses an enterprise database)
        const regionMap = {
            'us-east-1': ['US'],
            'eu-central-1': ['DE', 'FR', 'NL', 'BE', 'IT', 'ES'],
            'govcloud-us-west': ['US'] // Strict FedRAMP
        };

        const allowedCountries = regionMap[tenant.dataRegion];

        if (!allowedCountries || !allowedCountries.includes(requestCountry)) {
            logger.warn(`[SOVEREIGNTY] Blocked cross-region access. Tenant ${tenant.name} (${tenant.dataRegion}). Request from IP ${clientIp} (${requestCountry}).`);
            throw new ApiError(
                httpStatus.FORBIDDEN,
                `Data Sovereignty Violation: Your tenant data is restricted to ${tenant.dataRegion}. Access from ${requestCountry} is strictly prohibited.`
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};
