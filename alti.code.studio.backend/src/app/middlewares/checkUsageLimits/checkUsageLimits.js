/**
 * @deprecated This legacy Mongoose-based B2C limits file has been deprecated.
 * Enterprise billing and quota management is now handled by src/app/modules/finops/finops.middleware.js
 * using Prisma, UserBilling, and TenantBilling.
 */

export const checkUsageLimits = async (userId, session = null) => {
  console.warn('DEPRECATED: checkUsageLimits was called. Use finopsMiddleware instead.');
  return null;
};
