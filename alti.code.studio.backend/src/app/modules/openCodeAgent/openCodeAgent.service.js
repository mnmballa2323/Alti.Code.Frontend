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

const runTask = async (taskDescription, workspacePath) => {
  try {
    // 1. Try to communicate with running OpenCode Server serve daemon
    logger.info(`🔌 OpenCode: Sending task to serve daemon at ${OPENCODE_API_URL}...`);
    const response = await axios.post(`${OPENCODE_API_URL}/api/v1/sessions`, {
      task: taskDescription,
      workspace: workspacePath || process.cwd(),
    }, { timeout: 3000 });
    return response.data;
  } catch (error) {
    // 2. Fallback: If daemon is offline, execute command directly using local CLI binary (FIPS/Air-Gapped compliant)
    logger.warn(`⚠️ OpenCode serve daemon offline: ${error.message}. Spawning local opencode CLI child process...`);
    return new Promise((resolve, reject) => {
      const sanitizedTask = taskDescription.replace(/"/g, '\\"');
      const cmd = `opencode task "${sanitizedTask}"`;
      
      exec(cmd, { cwd: workspacePath || process.cwd() }, (execErr, stdout, stderr) => {
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
  if (sessionId.startsWith('local-cli-')) {
    return { sessionId, status: 'completed', message: 'Local execution completed.' };
  }
  try {
    const response = await axios.get(`${OPENCODE_API_URL}/api/v1/sessions/${sessionId}`);
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
