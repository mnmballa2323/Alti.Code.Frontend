const UserRepository = require('../auth/prisma.user.repository');
const ApiError = require('../../errors/ApiError');
const httpStatus = require('http-status');

/**
 * Resolves the absolute URL of the sovereign inference cluster
 * based on the user's selected cloud and isolation tier.
 */
class TenantResolverService {
  /**
   * Determine the API cluster base URL for a given user context
   * @param {string} userId - The user making the inference request
   * @returns {Promise<string>} The base URL of the target isolated cluster
   */
  async resolveClusterUrl(userId) {
    const user = await UserRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User context not found');
    }

    const cloud = user.preferredCloud || 'gcp';
    const tier = user.deploymentTier || 'MULTI_TENANT';
    const tenantId = user.tenantId;

    switch (tier) {
      case 'MULTI_TENANT':
        // Standard shared cluster boundary
        return `https://api.shared.${cloud}.alticodestudio.com`;

      case 'SINGLE_TENANT':
        // Isolated single-tenant boundary - physically separate VPC/Cluster
        if (!tenantId) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'User does not have an assigned tenant ID for single-tenant mode');
        }
        return `https://api.tenant-${tenantId}.${cloud}.alticodestudio.com`;

      case 'FEDRAMP':
        // Government compliant FIPS boundary
        const govDomains = {
          aws: 'https://api.govcloud.aws.alticodestudio.com',
          azure: 'https://api.gov.azure.alticodestudio.com',
          gcp: 'https://api.assured.gcp.alticodestudio.com'
        };
        return govDomains[cloud];

      default:
        throw new ApiError(httpStatus.BAD_REQUEST, 'Unknown deployment tier requested');
    }
  }
}

module.exports = new TenantResolverService();
