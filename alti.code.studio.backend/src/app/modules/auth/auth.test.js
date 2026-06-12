/**
 * Copyright (c) 2026 Inso Code
 * 
 * Auth Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './auth.service.js';
import { UserRepository } from './prisma.user.repository.js';
import { authenticateKeystone } from './openstack.service.js';
import config from '../../../../config/index.js';

// Mock dependencies
vi.mock('./prisma.user.repository.js', () => ({
  UserRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
  }
}));

vi.mock('./openstack.service.js', () => ({
  authenticateKeystone: vi.fn(),
  openstackService: {
    authenticateKeystone: vi.fn()
  }
}));

vi.mock('../../../shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}));

describe('AuthService - Login Integration', () => {
  const originalPrivateCloudMode = config.private_cloud_mode;

  beforeEach(() => {
    vi.clearAllMocks();
    config.private_cloud_mode = false;
  });

  afterEach(() => {
    config.private_cloud_mode = originalPrivateCloudMode;
  });

  describe('loginService with Local Auth', () => {
    it('should throw error if email or password is missing', async () => {
      await expect(authService.loginService(null, 'password')).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should throw error if user is not found locally', async () => {
      UserRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(authService.loginService('missing@example.com', 'password')).rejects.toThrow(
        'User not found, please register first'
      );
    });
  });

  describe('loginService with OpenStack Keystone Auth', () => {
    beforeEach(() => {
      config.private_cloud_mode = true;
    });

    it('should authenticate via Keystone and return tokens if local user already exists', async () => {
      const mockKeystoneUser = {
        keystoneToken: 'token-123',
        userId: 'ks-usr-1',
        username: 'cloud-admin',
        domain: 'Default',
        roles: ['user']
      };

      const mockLocalUser = {
        id: 'db-usr-1',
        email: 'cloud-admin@Default',
        provider: 'openstack',
        role: 'user',
        tenantId: 'tenant-1',
        tenantRole: 'owner'
      };

      authenticateKeystone.mockResolvedValueOnce(mockKeystoneUser);
      UserRepository.findByEmail.mockResolvedValueOnce(mockLocalUser);

      const result = await authService.loginService('cloud-admin@Default', 'password');

      expect(authenticateKeystone).toHaveBeenCalledWith('cloud-admin@Default', 'password');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result._id).toBe(mockLocalUser.id);
    });

    it('should authenticate via Keystone and provision a new user if not found locally', async () => {
      const mockKeystoneUser = {
        keystoneToken: 'token-123',
        userId: 'ks-usr-1',
        username: 'cloud-admin',
        projectName: 'MyVPC',
        domain: 'Default',
        roles: ['admin']
      };

      authenticateKeystone.mockResolvedValueOnce(mockKeystoneUser);
      UserRepository.findByEmail.mockResolvedValueOnce(null); // Not found locally

      // The service will fallback to mock provisioning if DB fails (which is fine for unit testing)
      const result = await authService.loginService('cloud-admin@Default', 'password');

      expect(authenticateKeystone).toHaveBeenCalledWith('cloud-admin@Default', 'password');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result._id).toBeDefined();
    });
  });
});
