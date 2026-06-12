/**
 * Copyright (c) 2026 Inso Code
 * 
 * OpenStack Keystone Authentication Service
 * 
 * Integrates with OpenStack Keystone v3 Identity API to authenticate users
 * deployed within the Liberty Center One Private Cloud.
 */

import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

/**
 * Authenticates user credentials with OpenStack Keystone v3
 * @param {string} usernameOrEmail - User's username or email
 * @param {string} password - User's password
 * @returns {Promise<object>} Keystone token metadata and user profile details
 */
export const authenticateKeystone = async (usernameOrEmail, password) => {
  const authUrl = config.openstack?.auth_url || process.env.OS_AUTH_URL || process.env.OPENSTACK_AUTH_URL;
  if (!authUrl) {
    logger.error('❌ OpenStack Keystone: OS_AUTH_URL configuration is missing');
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'OpenStack authentication endpoint is not configured.'
    );
  }

  // Parse username and domain from usernameOrEmail (e.g., admin@Default or user@libertycenterone.local)
  let username = usernameOrEmail;
  let domainName = config.openstack?.default_domain || process.env.OPENSTACK_DEFAULT_DOMAIN || 'Default';

  if (usernameOrEmail.includes('@')) {
    const parts = usernameOrEmail.split('@');
    username = parts[0];
    domainName = parts[1];
  }

  const tokenUrl = `${authUrl.replace(/\/$/, '')}/auth/tokens`;
  
  const authPayload = {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            name: username,
            domain: { name: domainName },
            password: password
          }
        }
      }
    }
  };

  logger.info(`🔑 OpenStack Keystone: Attempting authentication for user "${username}" in domain "${domainName}"`);

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(authPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.warn(`⚠️ OpenStack Keystone: Authentication failed for "${username}" - Status ${response.status}: ${errorText}`);
      
      if (response.status === httpStatus.UNAUTHORIZED) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OpenStack Keystone credentials.');
      }
      throw new ApiError(response.status, `Keystone Identity API Error: ${response.statusText}`);
    }

    const tokenHeader = response.headers.get('x-subject-token');
    const data = await response.json();

    if (!data.token) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Keystone response body is missing token metadata.');
    }

    const { user, project, roles } = data.token;
    
    logger.info(`✔ OpenStack Keystone: Successfully authenticated user "${username}" (ID: ${user?.id})`);

    return {
      keystoneToken: tokenHeader,
      userId: user?.id,
      username: user?.name,
      domain: user?.domain?.name || domainName,
      projectId: project?.id || null,
      projectName: project?.name || null,
      roles: roles?.map(r => r.name) || []
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('❌ OpenStack Keystone Connection Error:', error.message);
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      `Failed to connect to OpenStack Identity Service: ${error.message}`
    );
  }
};

export const openstackService = {
  authenticateKeystone
};
