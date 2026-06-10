import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const mockFilePath = path.join(process.cwd(), 'users_mock.json');

function getMockUsers() {
  try {
    if (fs.existsSync(mockFilePath)) {
      return JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading mock users:', e);
  }
  return [];
}

function saveMockUsers(users) {
  try {
    fs.writeFileSync(mockFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing mock users:', e);
  }
}

/**
 * Prisma User Repository with Development JSON Fallback
 * This acts as the Data Access Layer (DAL) for the new PostgreSQL architecture.
 * If PostgreSQL connection fails, it falls back to a local JSON file in development mode.
 */
export const UserRepository = {
  /**
   * Find a user by their email address
   */
  findByEmail: async (email) => {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.warn('⚠️ [Postgres Offline] Falling back to mock users database for findByEmail');
      const users = getMockUsers();
      return users.find(u => u.email === email) || null;
    }
  },

  /**
   * Find a user by their ID
   */
  findById: async (id) => {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (dbError) {
      console.warn('⚠️ [Postgres Offline] Falling back to mock users database for findById');
      const users = getMockUsers();
      return users.find(u => u.id === id) || null;
    }
  },

  /**
   * Create a new user with an automatically generated confirmation token
   */
  createUser: async (userData) => {
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const date = new Date();
    date.setDate(date.getDate() + 1);

    try {
      return await prisma.$transaction(async (tx) => {
        const tenantName = `Workspace - ${userData.email.split('@')[0]}_${crypto.randomBytes(3).toString('hex')}`;
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName,
          },
        });

        // Auto-set admin role in dev if email contains admin
        let role = 'unauthorized';
        if (userData.email.includes('admin')) {
          role = 'admin';
        }

        return tx.user.create({
          data: {
            ...userData,
            role,
            tenantId: tenant.id,
            tenantRole: 'owner',
            confirmationToken,
            confirmationTokenExpires: date,
          },
        });
      });
    } catch (dbError) {
      console.warn('⚠️ [Postgres Offline] Falling back to mock users database for createUser');
      const users = getMockUsers();
      
      const newUserId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      const newTenantId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      
      // Auto-set admin role in dev/mock if email contains admin, else default to user
      let role = 'user';
      if (userData.email.includes('admin')) {
        role = 'admin';
      }

      const newUser = {
        id: newUserId,
        tenantId: newTenantId,
        tenantRole: 'owner',
        provider: 'local',
        googleId: null,
        githubId: null,
        avatar: null,
        email: userData.email,
        password: userData.password,
        role: role,
        isSubscribed: true,
        subscriptionPrice: null,
        subscriptionPlan: 'command',
        subscriptionDur: 'month',
        subscriptionExp: null,
        subscriptionStat: 'paid',
        invoiceUrl: null,
        promptsUsed: 0,
        imagesUsed: 0,
        lastResetAt: new Date().toISOString(),
        confirmationToken: null,
        confirmationTokenExpires: null,
        resetPasswordOTP: null,
        resetPasswordExpires: null,
        deleteAccountOTP: null,
        deleteAccountExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      saveMockUsers(users);
      return newUser;
    }
  },

  /**
   * Update a user's role and remove confirmation tokens
   */
  confirmEmail: async (token) => {
    try {
      const user = await prisma.user.findFirst({
        where: { confirmationToken: token },
      });

      if (!user) return null;
      if (new Date() > user.confirmationTokenExpires) return 'EXPIRED';

      return await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'user',
          confirmationToken: null,
          confirmationTokenExpires: null,
        },
      });
    } catch (dbError) {
      console.warn('⚠️ [Postgres Offline] Falling back to mock users database for confirmEmail');
      const users = getMockUsers();
      const userIndex = users.findIndex(u => u.confirmationToken === token);
      if (userIndex === -1) return null;
      
      const user = users[userIndex];
      user.role = 'user';
      user.confirmationToken = null;
      user.confirmationTokenExpires = null;
      
      saveMockUsers(users);
      return user;
    }
  },

  /**
   * Universal update method
   */
  updateUser: async (id, updateData) => {
    try {
      return await prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (dbError) {
      console.warn('⚠️ [Postgres Offline] Falling back to mock users database for updateUser');
      const users = getMockUsers();
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) return null;
      
      users[userIndex] = {
        ...users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      saveMockUsers(users);
      return users[userIndex];
    }
  },

  /**
   * Social Login Upsert Logic
   */
  upsertSocialUser: async (payload) => {
    const { email, id, provider, avatar } = payload;
    
    try {
      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        // Link the account
        return await prisma.user.update({
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
      return await prisma.$transaction(async (tx) => {
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
    } catch (dbError) {
      console.warn('⚠️ [Postgres Offline] Falling back to mock users database for upsertSocialUser');
      const users = getMockUsers();
      let userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          googleId: provider === 'google' ? id : users[userIndex].googleId,
          githubId: provider === 'github' ? id : users[userIndex].githubId,
          avatar: avatar || users[userIndex].avatar,
          role: users[userIndex].role === 'unauthorized' ? 'user' : users[userIndex].role,
          updatedAt: new Date().toISOString()
        };
        saveMockUsers(users);
        return users[userIndex];
      }

      const newUserId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      const newTenantId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      
      const newUser = {
        id: newUserId,
        tenantId: newTenantId,
        tenantRole: 'owner',
        provider,
        googleId: provider === 'google' ? id : null,
        githubId: provider === 'github' ? id : null,
        avatar,
        email,
        password: null,
        role: 'user',
        isSubscribed: true,
        subscriptionPrice: null,
        subscriptionPlan: 'command',
        subscriptionDur: 'month',
        subscriptionExp: null,
        subscriptionStat: 'paid',
        invoiceUrl: null,
        promptsUsed: 0,
        imagesUsed: 0,
        lastResetAt: new Date().toISOString(),
        confirmationToken: null,
        confirmationTokenExpires: null,
        resetPasswordOTP: null,
        resetPasswordExpires: null,
        deleteAccountOTP: null,
        deleteAccountExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      saveMockUsers(users);
      return newUser;
    }
  }
};
