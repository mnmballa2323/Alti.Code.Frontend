/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import axios from 'axios';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import UserConnectionModel from './userConnection.model.js';
import { encryptionService } from '../security/encryption.service.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

// Initiate OAuth flow by redirecting to provider's login/consent page
const initiateOAuth = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const userId = req.user._id.toString();

  let authUrl = '';
  const redirectUri = `${config.client_url.replace(/:[0-9]+/, ':5000')}/api/v1/integrations/callback/${provider}`;

  if (provider === 'github') {
    const clientId = config.github.clientId;
    authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,read:user,user:email&state=${userId}`;
  } else if (provider === 'slack') {
    const clientId = process.env.SLACK_CLIENT_ID || '';
    authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=incoming-webhook,commands,chat:write&state=${userId}`;
  } else if (provider === 'jira') {
    const clientId = process.env.JIRA_CLIENT_ID || '';
    authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=read:jira-work%20write:jira-work%20offline_access&redirect_uri=${encodeURIComponent(redirectUri)}&state=${userId}&response_type=code&prompt=consent`;
  } else {
    return res.status(400).json({ success: false, message: `Unsupported provider: ${provider}` });
  }

  res.redirect(authUrl);
});

// Handle provider authorization code callback
const oauthCallback = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    logger.error('OAuth Callback: Missing authorization code or state');
    return res.redirect(`${config.client_url}/connect-apps?status=error&message=missing_callback_params`);
  }

  const redirectUri = `${config.client_url.replace(/:[0-9]+/, ':5000')}/api/v1/integrations/callback/${provider}`;
  let tokenData = {};

  try {
    if (provider === 'github') {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code,
          redirect_uri: redirectUri,
        },
        { headers: { Accept: 'application/json' } }
      );
      tokenData = response.data;
    } else if (provider === 'slack') {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          client_id: process.env.SLACK_CLIENT_ID || '',
          client_secret: process.env.SLACK_CLIENT_SECRET || '',
          code,
          redirect_uri: redirectUri,
        })
      );
      tokenData = response.data;
    } else if (provider === 'jira') {
      const response = await axios.post(
        'https://auth.atlassian.com/oauth/token',
        {
          grant_type: 'authorization_code',
          client_id: process.env.JIRA_CLIENT_ID || '',
          client_secret: process.env.JIRA_CLIENT_SECRET || '',
          code,
          redirect_uri: redirectUri,
        }
      );
      tokenData = response.data;
    }

    if (!tokenData || tokenData.error || (!tokenData.access_token && !tokenData.authed_user?.access_token)) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to fetch access tokens.');
    }

    // Envelope encrypt credentials at rest
    const encryptedCredentials = await encryptionService.encrypt(JSON.stringify(tokenData));

    // Save in DB
    await UserConnectionModel.findOneAndUpdate(
      { userId, provider: `mcp_${provider}` },
      {
        status: 'connected',
        credentials: encryptedCredentials,
      },
      { upsert: true, new: true }
    );

    res.redirect(`${config.client_url}/connect-apps?status=success&provider=${provider}`);
  } catch (error) {
    logger.error(`OAuth Integration Callback Error for ${provider}:`, error);
    res.redirect(`${config.client_url}/connect-apps?status=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Get user connections list
const getActiveConnections = catchAsync(async (req, res) => {
  const userId = req.user._id.toString();
  const connections = await UserConnectionModel.find({ userId, status: 'connected' }).select('provider status createdAt');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Active connections retrieved successfully',
    data: connections,
  });
});

// Disconnect/Remove a provider connection
const disconnectProvider = catchAsync(async (req, res) => {
  const userId = req.user._id.toString();
  const { provider } = req.params;

  await UserConnectionModel.findOneAndDelete({ userId, provider: `mcp_${provider}` });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Successfully disconnected ${provider} connection`,
  });
});

export const UserConnectionController = {
  initiateOAuth,
  oauthCallback,
  getActiveConnections,
  disconnectProvider,
};
