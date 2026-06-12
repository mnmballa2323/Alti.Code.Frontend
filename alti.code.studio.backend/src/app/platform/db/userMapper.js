/**
 * Copyright (c) 2026 Inso Code
 * 
 * Shared Database & User/Tenant Mapping Service
 */

import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

/**
 * Finds a user by their email address
 * @param {string} email 
 * @returns {Promise<object|null>}
 */
export const findUserByEmail = async (email) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    logger.warn(`⚠️ [Platform UserMapper] DB lookup failed for email ${email}. Falling back to undefined.`);
    return null;
  }
};

/**
 * Lazily provisions a new platform tenant
 * @param {string} tenantName 
 * @param {string} [domain] 
 * @returns {Promise<object>}
 */
export const createPlatformTenant = async (tenantName, domain) => {
  try {
    return await prisma.tenant.create({
      data: {
        name: tenantName,
        domain: domain || null,
        ssoEnabled: false,
      },
    });
  } catch (error) {
    logger.error('❌ [Platform UserMapper] Failed to create tenant:', error.message);
    throw error;
  }
};

/**
 * Upserts a platform user linked to a specific provider
 * @param {object} params 
 * @returns {Promise<object>}
 */
export const upsertPlatformUser = async ({ email, provider, role = 'user', tenantId, tenantRole = 'owner', googleId = null, githubId = null }) => {
  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // User exists, update provider links if needed
      return await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId || user.googleId,
          githubId: githubId || user.githubId,
          provider: provider || user.provider,
          role: user.role === 'unauthorized' ? role : user.role,
        },
      });
    }

    // Provision new user. If tenantId is not provided, lazily provision a new tenant workspace first
    let activeTenantId = tenantId;
    if (!activeTenantId) {
      const cleanPrefix = email.split('@')[0];
      const randomSuffix = crypto.randomBytes(3).toString('hex');
      const tenant = await createPlatformTenant(`Workspace - ${cleanPrefix}_${randomSuffix}`);
      activeTenantId = tenant.id;
    }

    return await prisma.user.create({
      data: {
        email,
        provider,
        role,
        tenantId: activeTenantId,
        tenantRole,
        googleId,
        githubId,
      },
    });
  } catch (error) {
    logger.error('❌ [Platform UserMapper] Failed to upsert platform user:', error.message);
    
    // In-memory fallback if database connection is completely offline
    const fallbackUserId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const fallbackTenantId = tenantId || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'));
    
    logger.warn('⚠️ [Platform UserMapper] Returning offline in-memory fallback user');
    return {
      id: fallbackUserId,
      email,
      provider,
      role,
      tenantId: fallbackTenantId,
      tenantRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};

export const userMapper = {
  findUserByEmail,
  createPlatformTenant,
  upsertPlatformUser,
};
