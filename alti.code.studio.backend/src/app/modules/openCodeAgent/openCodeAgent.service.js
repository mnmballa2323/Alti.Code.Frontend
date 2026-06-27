/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import axios from 'axios';
import httpStatus from 'http-status';
import { exec } from 'child_process';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

const OPENCODE_API_URL = process.env.OPENCODE_API_URL || 'http://localhost:4096';

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
            logger.info(`🔑 OpenCode: Dynamically injected user-scoped GITHUB_TOKEN environment variable.`);
          }
        }
      }
    }
  } catch (err) {
    logger.warn(`⚠️ OpenCode ContextEnv resolution failed: ${err.message}`);
  }
  return { ...process.env, ...customEnv };
};

const runTask = async (taskDescription, workspacePath) => {
  let taskVal = taskDescription;
  let workspaceVal = workspacePath;

  // Support single options object signature for Orchestrator compatibility
  if (typeof taskDescription === 'object' && taskDescription !== null) {
    taskVal = taskDescription.task || taskDescription.query || taskDescription.taskDescription;
    workspaceVal = taskDescription.workspace || taskDescription.workspacePath;
  }

  try {
    // 1. Try to communicate with running OpenCode Server serve daemon
    logger.info(`🔌 OpenCode: Sending task to serve daemon at ${OPENCODE_API_URL}...`);
    const response = await axios.post(`${OPENCODE_API_URL}/api/v1/sessions`, {
      task: taskVal,
      workspace: workspaceVal || process.cwd(),
    }, { timeout: 3000 });
    return response.data;
  } catch (error) {
    // 2. Fallback: If daemon is offline, execute command directly using local CLI binary
    logger.warn(`⚠️ OpenCode serve daemon offline: ${error.message}. Spawning local opencode CLI child process...`);
    const customEnv = await getContextEnv();
    
    return new Promise((resolve, reject) => {
      const sanitizedTask = String(taskVal).replace(/"/g, '\\"');
      const cmd = `opencode task "${sanitizedTask}"`;
      
      exec(cmd, { cwd: workspaceVal || process.cwd(), env: customEnv }, (execErr, stdout, stderr) => {
        if (execErr) {
          logger.error(`❌ OpenCode CLI Execution failed: ${execErr.message}`);
          return reject(new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `OpenCode CLI failed: ${execErr.message || stderr}`
          ));
        }
        resolve({
          sessionId: `local-cli-${Date.now()}`,
          status: 'completed',
          output: stdout,
        });
      });
    });
  }
};

const getTaskStatus = async sessionId => {
  let idVal = sessionId;

  // Support single options object signature for Orchestrator compatibility
  if (typeof sessionId === 'object' && sessionId !== null) {
    idVal = sessionId.sessionId || sessionId.id;
  }

  if (String(idVal).startsWith('local-cli-')) {
    return { sessionId: idVal, status: 'completed', message: 'Local execution completed.' };
  }
  try {
    const response = await axios.get(`${OPENCODE_API_URL}/api/v1/sessions/${idVal}`);
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to get task status from OpenCode server: ${error.message}`,
    );
  }
};

export const OpenCodeAgentService = {
  runTask,
  getTaskStatus,
};
