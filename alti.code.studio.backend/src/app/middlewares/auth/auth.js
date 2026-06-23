/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import { jwtHelpers } from '../../helpers/jwtHelpers.js';
// Removed Google Cloud IAP import

const auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      // 🛡️ AZURE ZERO-TRUST INTEGRATION
      const azurePrincipal = req.headers['x-ms-client-principal-name'];
      let verifiedUser;

      if (azurePrincipal) {
        verifiedUser = {
            email: azurePrincipal,
            role: 'USER',
            subject: req.headers['x-ms-client-principal-id'] || 'unknown-id'
        };
      } else {
          // Fallback to legacy Local Bearer JWT
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized (Missing IAP or Bearer Token)');
          }

          const token = authHeader.split(' ')[1];
          verifiedUser = jwtHelpers.verifyToken(token, config.jwt.access_token);
      }

      // 👇 Assign user to request object
      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role) && verifiedUser.role !== 'owner' && verifiedUser.role !== 'super_admin') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
