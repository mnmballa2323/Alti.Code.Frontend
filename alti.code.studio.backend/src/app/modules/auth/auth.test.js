/**
 * Copyright (c) 2026 Inso Code
 *
 * Auth Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './auth.service.js';
import { UserRepository } from './prisma.user.repository.js';
import { authenticateGCPAD } from './gcpIap.service.js';
import config from '../../../../config/index.js';

// Mock dependencies
vi.mock('./prisma.user.repository.js', () => ({
  UserRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
  },
}));

vi.mock('./gcpIap.service.js', () => ({
  authenticateGCPAD: vi.fn(),
}));

vi.mock('../../../shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
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
        'Email and password are required',
      );
    });

    it('should throw error if user is not found locally', async () => {
      UserRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(
        authService.loginService('missing@example.com', 'password'),
      ).rejects.toThrow('User not found, please register first');
    });
  });

  describe('loginService with Intercepted Mock Accounts', () => {
    it('should authenticate admin@insocode.com with ShelbyTownship#1 and return owner tokens', async () => {
      const result = await authService.loginService(
        'admin@insocode.com',
        'ShelbyTownship#1',
      );
      expect(result).toHaveProperty('accessToken');
      expect(result._id).toBe('84644de4-219b-4e40-84ea-55cefe3c71cd');
    });

    it('should authenticate owner@insocode.com with ShelbyTownship#1 and return owner tokens', async () => {
      const result = await authService.loginService(
        'owner@insocode.com',
        'ShelbyTownship#1',
      );
      expect(result).toHaveProperty('accessToken');
      expect(result._id).toBe('94644de4-219b-4e40-84ea-55cefe3c71cd');
    });
  });

  describe('loginService with GCP Workforce Identity Auth', () => {
    beforeEach(() => {
      config.private_cloud_mode = true;
    });

    it('should authenticate via GCP Workforce Identity and return tokens if local user already exists', async () => {
      const mockGCPUser = {
        username: 'cloud-admin',
        email: 'cloud-admin@Default',
        roles: ['user'],
        projectName: 'GCP-Sovereign-Workspace',
      };

      const mockLocalUser = {
        id: 'db-usr-1',
        email: 'cloud-admin@Default',
        provider: 'gcp',
        role: 'user',
        tenantId: 'tenant-1',
        tenantRole: 'owner',
      };

      authenticateGCPAD.mockResolvedValueOnce(mockGCPUser);
      UserRepository.findByEmail.mockResolvedValueOnce(mockLocalUser);

      const result = await authService.loginService(
        'cloud-admin@Default',
        'password',
      );

      expect(authenticateGCPAD).toHaveBeenCalledWith(
        'cloud-admin@Default',
        'password',
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result._id).toBe(mockLocalUser.id);
    });

    it('should authenticate via GCP Workforce Identity and provision a new user if not found locally', async () => {
      const mockGCPUser = {
        username: 'cloud-admin',
        email: 'cloud-admin@Default',
        roles: ['admin'],
        projectName: 'GCP-Sovereign-Workspace',
      };

      authenticateGCPAD.mockResolvedValueOnce(mockGCPUser);
      UserRepository.findByEmail.mockResolvedValueOnce(null); // Not found locally

      const result = await authService.loginService(
        'cloud-admin@Default',
        'password',
      );

      expect(authenticateGCPAD).toHaveBeenCalledWith(
        'cloud-admin@Default',
        'password',
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result._id).toBeDefined();
    });
  });
});
