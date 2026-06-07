/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { ShadowWorkspaceService } from './shadowWorkspace.service.js';

const initShadow = catchAsync(async (req, res) => {
    const result = await ShadowWorkspaceService.initShadow(req.body.sessionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Shadow workspace initialized',
        data: result,
    });
});

const applyDiff = catchAsync(async (req, res) => {
    const result = await ShadowWorkspaceService.applyDiff(req.body.sessionId, req.body.filePath, req.body.content);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Diff applied to shadow workspace',
        data: result,
    });
});

const runCommand = catchAsync(async (req, res) => {
    const result = await ShadowWorkspaceService.runCommand(req.body.sessionId, req.body.command);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Command executed in shadow workspace',
        data: result,
    });
});

const commitShadow = catchAsync(async (req, res) => {
    const result = await ShadowWorkspaceService.commitShadow(req.body.sessionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Shadow workspace committed to main',
        data: result,
    });
});

export const ShadowWorkspaceController = {
    initShadow,
    applyDiff,
    runCommand,
    commitShadow
};
