/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { RefactorAgentService } from './refactorAgent.service.js';

const startRefactor = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.body.sessionId || `refactor-${Date.now()}`;
    const result = await RefactorAgentService.refactorCode(req.body.code, req.body.instruction, userId, sessionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Code refactoring completed successfully',
        data: result,
    });
});

export const RefactorAgentController = {
    startRefactor,
};
