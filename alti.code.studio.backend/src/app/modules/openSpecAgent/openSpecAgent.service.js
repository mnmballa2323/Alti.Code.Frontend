/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'child_process';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';

const getContextEnv = async () => {
  const customEnv = {};
  try {
    const { mcpTokenContext } = await import('../mcp/mcp_gateway.service.js');
    const token = mcpTokenContext ? mcpTokenContext.getStore() : null;
    if (token) {
      let userId = null;
      if (token.startsWith('ey')) {
        const { jwtHelpers } = await import('../../helpers/jwtHelpers.js');
        const configObject = (await import('../../../../config/index.js')).default;
        try {
          const decoded = jwtHelpers.verifyToken(token, configObject.jwt.access_token);
          userId = decoded.userId || decoded.id;
        } catch (e) {
          const jwt = (await import('jsonwebtoken')).default;
          const decoded = jwt.decode(token);
          if (decoded) userId = decoded.userId || decoded.id;
        }
      } else if (token.length === 24) {
        userId = token;
      }

      if (userId) {
        const UserConnectionModel = (await import('../integrations/userConnection.model.js')).default;
        const { encryptionService } = await import('../security/encryption.service.js');
        
        // Resolve GitHub connection if available
        const githubConn = await UserConnectionModel.findOne({
          userId,
          provider: 'mcp_github',
          status: 'connected',
        });
        if (githubConn && githubConn.credentials) {
          const creds = JSON.parse(await encryptionService.decrypt(githubConn.credentials));
          const githubToken = creds.access_token || creds.authed_user?.access_token;
          if (githubToken) {
            customEnv.GITHUB_TOKEN = githubToken;
            customEnv.GITHUB_PERSONAL_ACCESS_TOKEN = githubToken;
            logger.info(`🔑 OpenSpec: Dynamically injected user-scoped GITHUB_TOKEN environment variable.`);
          }
        }
      }
    }
  } catch (err) {
    logger.warn(`⚠️ OpenSpec ContextEnv resolution failed: ${err.message}`);
  }
  return { ...process.env, ...customEnv };
};

const executeCommand = async (cmd, workspacePath) => {
  const customEnv = await getContextEnv();
  return new Promise((resolve, reject) => {
    logger.info(`📋 OpenSpec CLI: Executing [${cmd}] inside ${workspacePath || process.cwd()}...`);
    exec(cmd, { cwd: workspacePath || process.cwd(), env: customEnv }, (err, stdout, stderr) => {
      if (err) {
        logger.error(`❌ OpenSpec CLI Error: ${err.message}`);
        // If CLI is not installed globally, we fallback to running it via npx
        if (err.message.includes('command not found') && !cmd.startsWith('npx')) {
          logger.warn(`⚠️ CLI binary 'openspec' not found. Re-running via npx...`);
          return resolve(executeCommand(`npx -y @fission-ai/openspec@latest ${cmd.substring(9)}`, workspacePath));
        }
        return reject(new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `OpenSpec CLI failed: ${stderr || err.message}`
        ));
      }
      resolve({ output: stdout.trim(), error: stderr.trim() });
    });
  });
};

const init = async (workspacePath) => {
  let workspaceVal = workspacePath;
  if (typeof workspacePath === 'object' && workspacePath !== null) {
    workspaceVal = workspacePath.workspace || workspacePath.workspacePath;
  }
  return executeCommand('openspec init', workspaceVal);
};

const propose = async (name, workspacePath) => {
  let nameVal = name;
  let workspaceVal = workspacePath;

  if (typeof name === 'object' && name !== null) {
    nameVal = name.name || name.proposalName;
    workspaceVal = name.workspace || name.workspacePath;
  }

  if (!nameVal) throw new ApiError(httpStatus.BAD_REQUEST, 'Proposal name is required.');
  const sanitizedName = String(nameVal).replace(/[^a-zA-Z0-9_-]/g, '');
  return executeCommand(`openspec propose ${sanitizedName}`, workspaceVal);
};

const list = async (workspacePath) => {
  let workspaceVal = workspacePath;
  if (typeof workspacePath === 'object' && workspacePath !== null) {
    workspaceVal = workspacePath.workspace || workspacePath.workspacePath;
  }
  return executeCommand('openspec list', workspaceVal);
};

const validate = async (workspacePath) => {
  let workspaceVal = workspacePath;
  if (typeof workspacePath === 'object' && workspacePath !== null) {
    workspaceVal = workspacePath.workspace || workspacePath.workspacePath;
  }
  return executeCommand('openspec validate', workspaceVal);
};

export const OpenSpecAgentService = {
  init,
  propose,
  list,
  validate,
};
