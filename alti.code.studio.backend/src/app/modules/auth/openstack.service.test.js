/**
 * Copyright (c) 2026 Inso Code
 * 
 * OpenStack Keystone Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticateKeystone } from './openstack.service.js';
import config from '../../../../config/index.js';

describe('openstackService', () => {
  const originalAuthUrl = config.openstack?.auth_url;
  const originalDefaultDomain = config.openstack?.default_domain;

  beforeEach(() => {
    // Set standard configuration values
    if (!config.openstack) {
      config.openstack = {};
    }
    config.openstack.auth_url = 'http://identity.libertycenterone.com:5000/v3';
    config.openstack.default_domain = 'Default';
    
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    config.openstack.auth_url = originalAuthUrl;
    config.openstack.default_domain = originalDefaultDomain;
    vi.restoreAllMocks();
  });

  it('should authenticate successfully with Keystone and return token metadata', async () => {
    const mockKeystoneToken = 'gAAAAABm...subject-token';
    const mockResponseBody = {
      token: {
        methods: ['password'],
        user: {
          id: 'user-uuid-1234',
          name: 'cloud-admin',
          domain: { id: 'default', name: 'Default' }
        },
        project: {
          id: 'project-uuid-5678',
          name: 'sovereign-vpc',
          domain: { id: 'default', name: 'Default' }
        },
        roles: [
          { id: 'role-1', name: 'admin' },
          { id: 'role-2', name: 'member' }
        ]
      }
    };

    const mockHeaders = new Map();
    mockHeaders.set('x-subject-token', mockKeystoneToken);

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: {
        get: (name) => mockHeaders.get(name.toLowerCase())
      },
      json: async () => mockResponseBody
    });

    const result = await authenticateKeystone('cloud-admin@Default', 'secure-password');

    expect(fetch).toHaveBeenCalledWith(
      'http://identity.libertycenterone.com:5000/v3/auth/tokens',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          auth: {
            identity: {
              methods: ['password'],
              password: {
                user: {
                  name: 'cloud-admin',
                  domain: { name: 'Default' },
                  password: 'secure-password'
                }
              }
            }
          }
        })
      })
    );

    expect(result).toEqual({
      keystoneToken: mockKeystoneToken,
      userId: 'user-uuid-1234',
      username: 'cloud-admin',
      domain: 'Default',
      projectId: 'project-uuid-5678',
      projectName: 'sovereign-vpc',
      roles: ['admin', 'member']
    });
  });

  it('should fallback to default domain if domain is not provided in username', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: {
        get: () => 'token-123'
      },
      json: async () => ({
        token: {
          user: { id: 'usr-1', name: 'user1', domain: { name: 'Default' } },
          project: { id: 'proj-1', name: 'proj1' },
          roles: []
        }
      })
    });

    await authenticateKeystone('user1', 'password');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"domain":{"name":"Default"}')
      })
    );
  });

  it('should throw UNAUTHORIZED if Keystone returns 401', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'The request you have made requires authentication.'
    });

    await expect(authenticateKeystone('user', 'wrong-password')).rejects.toThrow(
      'Invalid OpenStack Keystone credentials.'
    );
  });

  it('should throw bad gateway on connection or fetch failures', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(authenticateKeystone('user', 'password')).rejects.toThrow(
      'Failed to connect to OpenStack Identity Service: Network error'
    );
  });

  it('should throw internal server error if OS_AUTH_URL is missing', async () => {
    config.openstack.auth_url = undefined;
    const originalEnv = process.env.OS_AUTH_URL;
    delete process.env.OS_AUTH_URL;
    delete process.env.OPENSTACK_AUTH_URL;

    try {
      await expect(authenticateKeystone('user', 'password')).rejects.toThrow(
        'OpenStack authentication endpoint is not configured.'
      );
    } finally {
      process.env.OS_AUTH_URL = originalEnv;
    }
  });
});
