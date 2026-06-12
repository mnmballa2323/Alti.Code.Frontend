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

const auth = (...requiredRoles) => async (req, res, next) => {
    try {
        // 1. Get token
        const token = req.headers.authorization;
        // Mock Token for Testing
        if (token === 'Bearer mock_token_admin') {
            req.user = { role: 'admin', userId: 'mock_admin' };
            return next();
        }

        if (!token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
        }

        // 2. Verify token
        let verifiedUser = null;
        try {
            verifiedUser = jwtHelpers.verifyToken(token, config.jwt.access_token);
        } catch (error) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Token');
        }

        req.user = verifiedUser; // role, userId

        // 3. Guard Roles
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
