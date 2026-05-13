import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { DebugAgentService } from './debugAgent.service.js';

const startDebug = catchAsync(async (req, res) => {
    const result = await DebugAgentService.analyzeError(req.body.errorLog, req.body.stackTrace);
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
