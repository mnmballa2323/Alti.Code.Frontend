/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError.js';
import { jwtHelpers } from '../helpers/jwtHelpers.js';
import config from '../../../config/index.js';
import { logger } from '../../shared/logger.js';
import { iapService } from '../modules/googleCloud/iap.service.js';

const auth = (...requiredRoles) => async (req, res, next) => {
    try {
        // 🛡️ BEYONDCORP ZERO-TRUST INTEGRATION
        const iapJwt = req.headers['x-goog-iap-jwt-assertion'];
        let verifiedUser = null;

        if (iapJwt) {
            try {
                // Cryptographically verify Google IAP Identity
                verifiedUser = await iapService.verifyIAPTokenDirectly(iapJwt);
                verifiedUser.role = verifiedUser.role || 'USER'; 
            } catch (iapError) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid BeyondCorp IAP Identity');
            }
        } else {
            // Fallback to legacy Local Bearer JWT
            const authHeader = req.headers.authorization;
            
            // Mock Token for Testing/Dev modes
            if (config.env !== 'production' && authHeader === 'Bearer mock_token_admin') {
                req.user = { role: 'admin', userId: 'mock_admin' };
                return next();
            }

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized (Missing IAP or Bearer Token)');
            }

            const token = authHeader.split(' ')[1];
            try {
                verifiedUser = jwtHelpers.verifyToken(token, config.jwt.access_token);
            } catch (error) {
                throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Token');
            }
        }

        req.user = verifiedUser; // role, userId

        // Guard Roles
        if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role) && verifiedUser.role !== 'owner' && verifiedUser.role !== 'super_admin') {
            logger.warn(`🛑 RBAC Block: User ${verifiedUser.role} tried to access allowed: ${requiredRoles}`);
            throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const authMiddleware = auth;
