/**
 * Copyright (c) 2026 Inso Code
 * 
 * Shared Product Capability & Access Control Middleware
 */

import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import { prisma } from '../db/prismaClient.js';

// Map of product IDs to permitted subscription tiers
export const PRODUCT_PLAN_MATRIX = {
  'inso-code': ['launch', 'build', 'scale', 'command'],
  'inso-ai': ['build', 'scale', 'command'],
  'inso-cloud': ['scale', 'command']
};

/**
 * Checks if a user has access to a given product based on their subscription tier
 * @param {object} user - User payload containing role and subscription/tenant info
 * @param {string} productId - Target product identifier (e.g. 'inso-code')
 * @returns {Promise<boolean>} True if authorized, false otherwise
 */
export const checkProductAccess = async (user, productId) => {
  // Global admins have access to everything
  if (user.role === 'admin' || user.role === 'ADMIN') {
    return true;
  }

  const allowedPlans = PRODUCT_PLAN_MATRIX[productId];
  if (!allowedPlans) {
    logger.warn(`⚠️ [Product Auth] Requested unknown product ID: "${productId}"`);
    return false;
  }

  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionPlan: true }
    });
    if (!userRecord) {
      return false;
    }
    const currentPlan = (userRecord.subscriptionPlan || 'launch').toLowerCase();
    return allowedPlans.includes(currentPlan);
  } catch (error) {
    logger.warn(`⚠️ [Product Auth] Database access failed checking subscription plan: ${error.message}`);
    // Under mock/offline environments without database seeding, fallback to config
    if (process.env.PRIVATE_CLOUD_MODE === 'true') {
      return true;
    }
    const currentPlan = (user.subscriptionPlan || 'launch').toLowerCase();
    return allowedPlans.includes(currentPlan);
  }
};

/**
 * Express middleware enforcing product-specific access permissions
 * @param {string} productId - Target product identifier
 * @returns {Function} Express middleware callback
 */
export const requireProductAccess = (productId) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required.');
      }

      const hasAccess = await checkProductAccess(user, productId);
      if (!hasAccess) {
        logger.warn(`🚫 [Product Auth] User ${user.id} denied access to ${productId}.`);
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Access to ${productId} is not included in your current plan. Please upgrade to support this capability.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const productValidator = {
  PRODUCT_PLAN_MATRIX,
  checkProductAccess,
  requireProductAccess
};
export default productValidator;
