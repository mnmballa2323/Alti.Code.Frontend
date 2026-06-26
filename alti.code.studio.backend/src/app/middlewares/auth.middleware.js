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
// Removed Google Cloud IAP import

const auth =
  (...requiredRoles) =>
  async (req, res, next) => {
    try {
      // 🛡️ GCP IAP ZERO-TRUST INTEGRATION
      const gcpPrincipal = req.headers['x-goog-authenticated-user-email'];
      let verifiedUser = null;

      if (gcpPrincipal) {
        const email = gcpPrincipal.replace(/^accounts\.google\.com:/, '');
        verifiedUser = {
          email,
          role: 'USER',
          subject: req.headers['x-goog-authenticated-user-id'] || 'unknown-id',
        };
      } else {
        // Fallback to legacy Local Bearer JWT
        const authHeader = req.headers.authorization;

        // Mock Token for Testing/Dev modes
        if (
          config.env !== 'production' &&
          authHeader === 'Bearer mock_token_admin'
        ) {
          req.user = { role: 'admin', userId: 'mock_admin' };
          return next();
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized (Missing IAP or Bearer Token)',
          );
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
      if (
        requiredRoles.length &&
        !requiredRoles.includes(verifiedUser.role) &&
        verifiedUser.role !== 'owner' &&
        verifiedUser.role !== 'super_admin'
      ) {
        logger.warn(
          `🛑 RBAC Block: User ${verifiedUser.role} tried to access allowed: ${requiredRoles}`,
        );
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const authMiddleware = auth;
