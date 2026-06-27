/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { OpenCodeAgentService } from './openCodeAgent.service.js';

const startSession = catchAsync(async (req, res) => {
  const { task, workspace } = req.body;

  if (!task) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: 'task is required.' });
  }

  const result = await OpenCodeAgentService.runTask(task, workspace);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'OpenCode SWE session started.',
    data: result,
  });
});

const getSessionStatus = catchAsync(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: 'sessionId is required.' });
  }

  const status = await OpenCodeAgentService.getTaskStatus(sessionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OpenCode session status retrieved.',
    data: status,
  });
});

export const OpenCodeAgentController = {
  startSession,
  getSessionStatus,
};
