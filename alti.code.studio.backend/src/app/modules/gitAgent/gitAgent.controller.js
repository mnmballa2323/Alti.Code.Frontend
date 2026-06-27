/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import path from 'path';
import fs from 'fs';
import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GitAgentService } from './gitAgent.service.js';

const commit = catchAsync(async (req, res) => {
  const { message } = req.body;
  const result = await GitAgentService.commitChanges(message);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Changes committed successfully',
    data: result,
  });
});

const push = catchAsync(async (req, res) => {
  const result = await GitAgentService.pushChanges();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Changes pushed successfully',
    data: result,
  });
});

const getStatus = catchAsync(async (req, res) => {
  const result = await GitAgentService.getStatus();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Git Agent Status retrieved',
    data: result,
  });
});

const getDiff = catchAsync(async (req, res) => {
  const result = await GitAgentService.getDiff();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Git diff retrieved',
    data: { diff: result },
  });
});

const generatePR = catchAsync(async (req, res) => {
  const result = await GitAgentService.generatePRDescription();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pull Request description generated',
    data: { description: result },
  });
});

const createBranch = catchAsync(async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Branch name is required',
      data: null,
    });
  }
  const result = await GitAgentService.createBranch(name.trim());
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Branch "${name.trim()}" created`,
    data: result,
  });
});

const initializeRepository = catchAsync(async (req, res) => {
  const { repoName, description, isPrivate } = req.body;

  if (!repoName) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'repoName is required',
      data: null,
    });
  }

  const result = await GitAgentService.initializeRepository(
    repoName,
    description,
    isPrivate,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Repository "${repoName}" successfully initialized.`,
    data: result,
  });
});

const handleGithubWebhook = catchAsync(async (req, res) => {
  // Acknowledge immediately to avoid GitHub timeout
  res.status(httpStatus.OK).send('Webhook received');

  // Process in background
  const event = req.headers['x-github-event'] || req.headers['X-GitHub-Event'];
  const payload = req.body;

  // We only care about pull_request events for this CI pipeline
  if (event === 'pull_request') {
    GitAgentService.processPullRequestWebhook(payload).catch(err => {
      console.error('Failed to process PR webhook', err);
    });
  }
});

const listRepositories = catchAsync(async (req, res) => {
  const { q } = req.query;
  const userId = req.user?.userId || req.user?.id;
  const result = await GitAgentService.searchRepositories(q, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Repositories fetched successfully',
    data: result,
  });
});

const changeDirectory = catchAsync(async (req, res) => {
  const { path: newPath } = req.body;
  if (!newPath) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Path is required',
    });
  }

  try {
    const resolvedPath = path.resolve(newPath);
    const stats = await fs.promises.stat(resolvedPath);
    if (!stats.isDirectory()) {
      throw new Error('Target path is not a directory');
    }

    process.chdir(resolvedPath);
    console.log(`📁 [Workspace] Successfully changed active working directory to: ${resolvedPath}`);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Active workspace changed to ${resolvedPath}`,
      data: {
        path: resolvedPath,
      },
    });
  } catch (err) {
    console.error(`❌ [Workspace] Failed to change directory to ${newPath}: ${err.message}`);
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: `Failed to change directory: ${err.message}`,
    });
  }
});

export const GitAgentController = {
  commit,
  push,
  getStatus,
  getDiff,
  generatePR,
  createBranch,
  initializeRepository,
  handleGithubWebhook,
  listRepositories,
  changeDirectory,
};
