/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { DebugAgentService } from './debugAgent.service.js';

const startDebug = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.body.sessionId || `debug-${Date.now()}`;
    const result = await DebugAgentService.analyzeError(req.body.errorLog, req.body.stackTrace, userId, sessionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Error analysis completed successfully',
        data: result,
    });
});

export const DebugAgentController = {
    startDebug,
};
