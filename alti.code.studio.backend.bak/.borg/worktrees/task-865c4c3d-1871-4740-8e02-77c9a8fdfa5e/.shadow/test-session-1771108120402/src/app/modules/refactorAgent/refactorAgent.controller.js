import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { RefactorAgentService } from './refactorAgent.service.js';

const startRefactor = catchAsync(async (req, res) => {
    const result = await RefactorAgentService.refactorCode(req.body.code, req.body.instruction);
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
