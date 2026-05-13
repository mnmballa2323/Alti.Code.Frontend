/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import { jwtHelpers } from '../../helpers/jwtHelpers.js';
<<<<<<< HEAD
=======
import { iapService } from '../../modules/googleCloud/iap.service.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)


const auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
<<<<<<< HEAD
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      const token = authHeader.split(' ')[1];

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_token,
      );

=======
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

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
      // 👇 Assign user to request object
      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
