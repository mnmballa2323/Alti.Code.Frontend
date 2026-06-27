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

const executeCommand = (cmd, workspacePath) => {
  return new Promise((resolve, reject) => {
    logger.info(`📋 OpenSpec CLI: Executing [${cmd}] inside ${workspacePath || process.cwd()}...`);
    exec(cmd, { cwd: workspacePath || process.cwd() }, (err, stdout, stderr) => {
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
  return executeCommand('openspec init', workspacePath);
};

const propose = async (name, workspacePath) => {
  if (!name) throw new ApiError(httpStatus.BAD_REQUEST, 'Proposal name is required.');
  const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '');
  return executeCommand(`openspec propose ${sanitizedName}`, workspacePath);
};

const list = async (workspacePath) => {
  return executeCommand('openspec list', workspacePath);
};

const validate = async (workspacePath) => {
  return executeCommand('openspec validate', workspacePath);
};

export const OpenSpecAgentService = {
  init,
  propose,
  list,
  validate,
};
