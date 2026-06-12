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
import { iapService } from '../../modules/googleCloud/iap.service.js';

const auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      // 🛡️ BEYONDCORP ZERO-TRUST INTEGRATION
      const iapJwt = req.headers['x-goog-iap-jwt-assertion'];
      let verifiedUser;

      if (iapJwt) {
        try {
            // Cryptographically verify Google IAP Identity
            verifiedUser = await iapService.verifyIAPTokenDirectly(iapJwt);
            // Map Google Identity to standard role if needed (default to USER for IAP)
            verifiedUser.role = verifiedUser.role || 'USER'; 
        } catch (iapError) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid BeyondCorp IAP Identity');
        }
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
