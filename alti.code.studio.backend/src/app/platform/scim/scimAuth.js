import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import { prisma, getTenantPrisma } from '../db/prismaClient.js';
import { logger } from '../../../shared/logger.js';

export const requireScimToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Authorization header is missing or malformed.',
          status: '401',
        })
      );
    }

    const token = authHeader.split(' ')[1];
    const secret = config.jwt?.access_token || process.env.JWT_ACCESS_TOKEN;
    if (!secret) {
      logger.error('❌ [SCIM Auth] JWT secret configuration is missing');
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'JWT signing configuration is missing.'
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      logger.warn('⚠️ [SCIM Auth] SCIM token verification failed:', err.message);
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Invalid or expired SCIM token.',
          status: '401',
        })
      );
    }

    const tenantId = decoded.tenantId;
    if (!tenantId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Token is missing tenant context.',
          status: '403',
        })
      );
    }

    // Lookup tenant config metadata
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, dedicatedDatabaseUrl: true },
    });

    if (!tenant) {
      logger.warn(`🚫 [SCIM Auth] Unknown tenant ID requested: ${tenantId}`);
      throw new ApiError(
        httpStatus.FORBIDDEN,
        JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Tenant workspace not found.',
          status: '403',
        })
      );
    }

    // Set request context
    req.tenantId = tenant.id;
    if (tenant.dedicatedDatabaseUrl) {
      req.db = getTenantPrisma(tenant.id, tenant.dedicatedDatabaseUrl);
    } else {
      req.db = prisma;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const scimAuth = {
  requireScimToken,
};
export default scimAuth;
