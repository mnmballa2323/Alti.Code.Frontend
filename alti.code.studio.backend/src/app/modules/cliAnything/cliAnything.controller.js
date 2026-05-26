/**
 * Copyright (c) 2024–2026 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { CliAnythingService } from './cliAnything.service.js';

/**
 * Generate an agent-native stateful CLI harness from a target directory
 */
const generate = (req, res) => {
  const { workspacePath, appName, stream = true } = req.body;

  if (!workspacePath || !appName) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Both workspacePath and appName are required.'
    });
  }

  if (!stream) {
    // Standard non-streaming JSON endpoint
    return catchAsync(async (req, res) => {
      const result = await CliAnythingService.generateCLI(workspacePath, appName);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Stateful CLI successfully compiled.',
        data: result
      });
    })(req, res);
  }

  // Setup Server-Sent Events (SSE) streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onPhaseUpdate = (phase, status, message, data = null) => {
    res.write(`data: ${JSON.stringify({
      type: 'phase_update',
      phase,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    })}\n\n`);
  };

  CliAnythingService.generateCLI(workspacePath, appName, {}, onPhaseUpdate)
    .then((result) => {
      res.write(`data: ${JSON.stringify({
        type: 'done',
        success: true,
        message: 'Swarm Compiler: All 7 phases completed successfully!',
        data: result
      })}\n\n`);
      res.end();
    })
    .catch((err) => {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        success: false,
        message: err.message
      })}\n\n`);
      res.end();
    });
};

/**
 * Perform gap-analysis and refine/extend existing commands
 */
const refine = catchAsync(async (req, res) => {
  const { workspacePath, appName, prompt } = req.body;

  if (!workspacePath || !appName || !prompt) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'workspacePath, appName, and prompt are all required.'
    });
  }

  const result = await CliAnythingService.refineCLI(workspacePath, appName, prompt);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CLI successfully expanded and refined.',
    data: result
  });
});

/**
 * Scan workspace for existing CLI-Anything compatible CLIs
 */
const discover = catchAsync(async (req, res) => {
  const { path: workspacePath } = req.query;

  if (!workspacePath) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Workspace path parameter is required.'
    });
  }

  const result = await CliAnythingService.discoverCLIs(workspacePath);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Agentic CLIs discovery search completed.',
    data: result
  });
});

export const CliAnythingController = {
  generate,
  refine,
  discover
};
