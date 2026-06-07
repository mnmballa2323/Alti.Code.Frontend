/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

export const rbac = (...requiredRoles) => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
            }

            if (requiredRoles.length && !requiredRoles.includes(user.role)) {
                throw new ApiError(
                    httpStatus.FORBIDDEN,
                    'You/Your Role are/is not authorized to perform this action',
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
