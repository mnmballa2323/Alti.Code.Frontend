/**
 * Copyright (c) 2026 Inso Code
 * 
 * Shared Authentication & Session Validation Middleware
 */

import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

/**
 * Validates a platform session JWT token
 * @param {string} token - JWT Access Token
 * @returns {object} Decoded token payload
 */
export const validateSessionToken = (token) => {
  const secret = config.jwt?.access_token || process.env.JWT_ACCESS_TOKEN;
  if (!secret) {
    logger.error('❌ [Platform Auth] JWT access token secret configuration is missing');
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'JWT signing configuration is missing.'
    );
  }
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.warn('⚠️ [Platform Auth] Session token verification failed:', error.message);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired session token.');
  }
};

/**
 * Express middleware enforcing authentication and tenant-level access roles
 * @param {string[]} [allowedRoles] - Array of permitted roles (e.g. ['owner', 'admin', 'developer'])
 * @returns {Function} Express middleware callback
 */
export const requirePlatformTenant = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header missing or invalid format.');
      }

      const token = authHeader.split(' ')[1];
      const decoded = validateSessionToken(token);

      // Map properties uniformly (supporting both _id and id properties)
      const userPayload = {
        id: decoded._id || decoded.id,
        role: decoded.role,
        tenantId: decoded.tenantId,
        tenantRole: decoded.tenantRole
      };

      if (!userPayload.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid session token: User context is missing.');
      }

      // Check tenant-level RBAC role authorization if restricted
      if (allowedRoles.length > 0) {
        const hasAccess = allowedRoles.includes(userPayload.tenantRole) || userPayload.role === 'admin';
        if (!hasAccess) {
          logger.warn(`🚫 [Platform Auth] Denied access: User ${userPayload.id} does not possess permissions ${allowedRoles}`);
          throw new ApiError(httpStatus.FORBIDDEN, 'Insufficient workspace access permissions.');
        }
      }

      req.user = userPayload;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const sessionValidator = {
  validateSessionToken,
  requirePlatformTenant
};
