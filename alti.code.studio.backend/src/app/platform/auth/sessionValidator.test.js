/**
 * Copyright (c) 2026 Inso Code
 * 
 * Session Validator Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { validateSessionToken, requirePlatformTenant } from './sessionValidator.js';
import config from '../../../../config/index.js';

describe('Platform Session Validator', () => {
  const originalSecret = config.jwt?.access_token;
  const mockSecret = 'super-secret-key-for-platform-testing-12345';

  beforeEach(() => {
    if (!config.jwt) config.jwt = {};
    config.jwt.access_token = mockSecret;
  });

  afterEach(() => {
    config.jwt.access_token = originalSecret;
    vi.restoreAllMocks();
  });

  describe('validateSessionToken', () => {
    it('should successfully decode valid JWT tokens', () => {
      const payload = { _id: 'user-1', role: 'user', tenantId: 'tenant-123', tenantRole: 'owner' };
      const token = jwt.sign(payload, mockSecret, { expiresIn: '1h' });

      const decoded = validateSessionToken(token);
      expect(decoded).toMatchObject(payload);
    });

    it('should throw UNAUTHORIZED for expired or invalid signatures', () => {
      const payload = { _id: 'user-1' };
      const expiredToken = jwt.sign(payload, mockSecret, { expiresIn: '-1s' });

      expect(() => validateSessionToken(expiredToken)).toThrow('Invalid or expired session token.');
    });
  });

  describe('requirePlatformTenant Express Middleware', () => {
    it('should inject req.user and call next() on valid token', () => {
      const payload = { _id: 'user-1', role: 'user', tenantId: 'tenant-1', tenantRole: 'developer' };
      const token = jwt.sign(payload, mockSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = vi.fn();

      const middleware = requirePlatformTenant();
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual({
        id: 'user-1',
        role: 'user',
        tenantId: 'tenant-1',
        tenantRole: 'developer'
      });
    });

    it('should return FORBIDDEN if user lacks required tenant role', () => {
      const payload = { _id: 'user-1', role: 'user', tenantId: 'tenant-1', tenantRole: 'viewer' };
      const token = jwt.sign(payload, mockSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = vi.fn();

      const middleware = requirePlatformTenant(['owner', 'developer']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.FORBIDDEN,
          message: 'Insufficient workspace access permissions.'
        })
      );
    });

    it('should bypass tenant roles check if user global role is admin', () => {
      const payload = { _id: 'admin-1', role: 'admin', tenantId: 'tenant-1', tenantRole: 'viewer' };
      const token = jwt.sign(payload, mockSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = vi.fn();

      const middleware = requirePlatformTenant(['owner', 'developer']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(); // admin bypasses and calls next()
    });

    it('should return UNAUTHORIZED if authorization header is absent', () => {
      const req = { headers: {} };
      const res = {};
      const next = vi.fn();

      const middleware = requirePlatformTenant();
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: 'Authorization header missing or invalid format.'
        })
      );
    });
  });
});
