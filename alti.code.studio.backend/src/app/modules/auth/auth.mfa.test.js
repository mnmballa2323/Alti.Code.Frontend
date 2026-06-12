import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { authService } from './auth.service.js';
import { UserRepository } from './prisma.user.repository.js';
import { totp } from '@inso/platform';
import config from '../../../../config/index.js';
import bcrypt from 'bcryptjs';
import { authenticateKeystone } from './openstack.service.js';

vi.mock('./openstack.service.js', () => ({
  authenticateKeystone: vi.fn(),
}));

vi.mock('./prisma.user.repository.js', () => ({
  UserRepository: {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    updateUser: vi.fn(),
  },
}));

vi.mock('../../middlewares/sendEmail/sendMailWithGoogleWorkspace.js', () => ({
  sendMailWithGoogleWorkspace: vi.fn(),
}));

describe('Multi-Factor Authentication (MFA) Integration', () => {
  const mockSecret = 'super-secret-key-for-mfa-testing-12345';
  let originalSecret;

  const mockUser = {
    id: 'user-123',
    email: 'mfa.user@example.com',
    password: '$2a$10$hashedpasswordhere', // bcrypt for 'password123'
    role: 'user',
    tenantId: 'tenant-123',
    tenantRole: 'owner',
    mfaEnabled: false,
    mfaSecret: null,
    tempMfaSecret: null,
  };

  beforeEach(() => {
    originalSecret = config.jwt?.access_token;
    if (!config.jwt) config.jwt = {};
    config.jwt.access_token = mockSecret;
    config.jwt.access_expires_in = '1h';
    config.jwt.refresh_token = mockSecret;
    config.jwt.refresh_expires_in = '7d';
    vi.clearAllMocks();
  });

  afterEach(() => {
    config.jwt.access_token = originalSecret;
  });

  describe('Login Flow with MFA Enforced', () => {
    it('should prompt for MFA and return an mfaToken if user has MFA active', async () => {
      const activeMfaUser = {
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      UserRepository.findByEmail.mockResolvedValueOnce(activeMfaUser);
      vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await authService.loginService('mfa.user@example.com', 'password123');

      expect(result).toEqual(
        expect.objectContaining({
          mfaRequired: true,
          mfaToken: expect.any(String),
        })
      );

      // Verify the temp MFA token payload
      const decoded = jwt.verify(result.mfaToken, mockSecret);
      expect(decoded).toEqual(
        expect.objectContaining({
          userId: 'user-123',
          tempMfa: true,
        })
      );
    });
  });

  describe('MFA Setup Flow', () => {
    it('should generate setup secret and otpauth URI and store secret temporarily', async () => {
      UserRepository.findById.mockResolvedValueOnce(mockUser);
      UserRepository.updateUser.mockResolvedValueOnce({
        ...mockUser,
        tempMfaSecret: 'NEWSECRETBASE32KEY',
      });

      const result = await authService.setupMfaService('user-123');

      expect(result).toEqual(
        expect.objectContaining({
          secret: expect.any(String),
          otpauthUri: expect.stringContaining('otpauth://totp/'),
        })
      );
      expect(UserRepository.updateUser).toHaveBeenCalledWith('user-123', {
        tempMfaSecret: result.secret,
      });
    });
  });

  describe('MFA Verification Flow', () => {
    it('should verify TOTP code and enable MFA on the user account', async () => {
      const pendingUser = {
        ...mockUser,
        tempMfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      UserRepository.findById.mockResolvedValueOnce(pendingUser);
      UserRepository.updateUser.mockResolvedValueOnce({
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
        tempMfaSecret: null,
      });

      const code = totp.getTotpCode('JBSWY3DPEHPK3PXP', Math.floor(Date.now() / 1000 / 30));
      const result = await authService.verifyMfaService('user-123', code);

      expect(result).toEqual({ success: true });
      expect(UserRepository.updateUser).toHaveBeenCalledWith('user-123', {
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
        tempMfaSecret: null,
      });
    });

    it('should reject invalid verification codes', async () => {
      const pendingUser = {
        ...mockUser,
        tempMfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      UserRepository.findById.mockResolvedValueOnce(pendingUser);

      await expect(
        authService.verifyMfaService('user-123', '000000')
      ).rejects.toThrow('Invalid verification code.');
    });
  });

  describe('MFA Challenge Flow', () => {
    it('should validate MFA challenge and issue session JWT tokens on success', async () => {
      const activeMfaUser = {
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      UserRepository.findById.mockResolvedValueOnce(activeMfaUser);

      const mfaToken = jwt.sign(
        { userId: 'user-123', tempMfa: true },
        mockSecret,
        { expiresIn: '5m' }
      );

      const code = totp.getTotpCode('JBSWY3DPEHPK3PXP', Math.floor(Date.now() / 1000 / 30));
      const result = await authService.validateMfaChallengeService(mfaToken, code);

      expect(result).toEqual(
        expect.objectContaining({
          _id: 'user-123',
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        })
      );
    });

    it('should throw UNAUTHORIZED on expired or invalid tokens in challenge', async () => {
      const invalidMfaToken = 'invalid-mfa-token-jwt';
      await expect(
        authService.validateMfaChallengeService(invalidMfaToken, '123456')
      ).rejects.toThrow('Invalid or expired MFA token.');
    });
  });
});
