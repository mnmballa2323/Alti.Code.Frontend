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
      // 🛡️ GCP IAP ZERO-TRUST INTEGRATION
      const gcpPrincipal = req.headers['x-goog-authenticated-user-email'];
      let verifiedUser;

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
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized (Missing IAP or Bearer Token)',
          );
        }

        const token = authHeader.split(' ')[1];
        verifiedUser = jwtHelpers.verifyToken(token, config.jwt.access_token);
      }

      // 👇 Assign user to request object
      req.user = verifiedUser;

      if (
        requiredRoles.length &&
        !requiredRoles.includes(verifiedUser.role) &&
        verifiedUser.role !== 'owner' &&
        verifiedUser.role !== 'super_admin'
      ) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
