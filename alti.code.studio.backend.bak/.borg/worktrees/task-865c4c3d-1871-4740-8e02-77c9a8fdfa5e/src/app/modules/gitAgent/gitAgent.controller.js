/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
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

export const GitAgentController = {
    commit,
    push,
    getStatus
};
