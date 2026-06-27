/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { OpenSpecAgentService } from './openSpecAgent.service.js';

const initProject = catchAsync(async (req, res) => {
  const { workspace } = req.body;
  const result = await OpenSpecAgentService.init(workspace);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OpenSpec initialized successfully.',
    data: result,
  });
});

const createProposal = catchAsync(async (req, res) => {
  const { name, workspace } = req.body;
  const result = await OpenSpecAgentService.propose(name, workspace);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'OpenSpec proposal created.',
    data: result,
  });
});

const listProposals = catchAsync(async (req, res) => {
  const { workspace } = req.query;
  const result = await OpenSpecAgentService.list(workspace);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OpenSpec proposals list retrieved.',
    data: result,
  });
});

const validateSpecs = catchAsync(async (req, res) => {
  const { workspace } = req.query;
  const result = await OpenSpecAgentService.validate(workspace);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OpenSpec specifications validation completed.',
    data: result,
  });
});

export const OpenSpecAgentController = {
  initProject,
  createProposal,
  listProposals,
  validateSpecs,
};
