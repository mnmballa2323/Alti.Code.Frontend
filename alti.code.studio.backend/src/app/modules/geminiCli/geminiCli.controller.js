/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GeminiCliService } from './geminiCli.service.js';

const runCommand = catchAsync(async (req, res) => {
  const { command, args } = req.body;

  if (!command) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Command is required.',
      data: null,
    });
  }

  const result = await GeminiCliService.runGeminiCLI(command, args || []);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Command executed successfully.',
    data: result,
  });
});

const streamCommand = (req, res) => {
  const { command, args } = req.body;

  if (!command) {
    res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Command is required.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  GeminiCliService.streamGeminiCLI(command, args || [], res);
};

const getHistory = catchAsync(async (req, res) => {
  const history = GeminiCliService.getHistory();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'History retrieved.',
    data: history,
  });
});

const clearHistory = catchAsync(async (req, res) => {
  GeminiCliService.clearHistory();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'History cleared.',
    data: null,
  });
});

export const GeminiCliController = {
  runCommand,
  streamCommand,
  getHistory,
  clearHistory,
};
