import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';

/**
 * Prisma User Repository
 * This acts as the Data Access Layer (DAL) for the new PostgreSQL architecture.
 * It strictly mirrors the legacy Mongoose methods while returning predictable Prisma schemas.
 */
export const UserRepository = {
  /**
   * Find a user by their email address
   */
  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Find a user by their ID
   */
  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Create a new user with an automatically generated confirmation token
   */
  createUser: async (userData) => {
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const date = new Date();
    date.setDate(date.getDate() + 1);

    return prisma.$transaction(async (tx) => {
      const tenantName = `Workspace - ${userData.email.split('@')[0]}_${crypto.randomBytes(3).toString('hex')}`;
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
        },
      });

      return tx.user.create({
        data: {
          ...userData,
          tenantId: tenant.id,
          tenantRole: 'owner',
          confirmationToken,
          confirmationTokenExpires: date,
        },
      });
    });
  },

  /**
   * Update a user's role and remove confirmation tokens
   */
  confirmEmail: async (token) => {
    const user = await prisma.user.findFirst({
      where: { confirmationToken: token },
    });

    if (!user) return null;
    if (new Date() > user.confirmationTokenExpires) return 'EXPIRED';

    return prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'user',
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
    });
  },

  /**
   * Universal update method
   */
  updateUser: async (id, updateData) => {
    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Social Login Upsert Logic
   */
  upsertSocialUser: async (payload) => {
    const { email, id, provider, avatar } = payload;
    
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link the account
      return prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: provider === 'google' ? id : user.googleId,
          githubId: provider === 'github' ? id : user.githubId,
          avatar: avatar || user.avatar,
          role: user.role === 'unauthorized' ? 'user' : user.role,
        },
      });
    }

    // Create new social user
    return prisma.$transaction(async (tx) => {
      const tenantName = `Workspace - ${email.split('@')[0]}_${crypto.randomBytes(3).toString('hex')}`;
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
        },
      });

      return tx.user.create({
        data: {
          email,
          googleId: provider === 'google' ? id : null,
          githubId: provider === 'github' ? id : null,
          avatar,
          provider,
          role: 'user',
          tenantId: tenant.id,
          tenantRole: 'owner',
        },
      });
    });
  }
};
