import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { HarnessService } from './harness.service.js';

const runPipeline = catchAsync(async (req, res) => {
    const result = await HarnessService.executePipeline(req.body.pipelineId, req.body.inputs);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Harness pipeline triggered successfully',
        data: result,
    });
});

const checkStatus = catchAsync(async (req, res) => {
    const result = await HarnessService.getExecutionStatus(req.params.executionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Harness pipeline status retrieved',
        data: result,
    });
});

export const HarnessController = {
    runPipeline,
    checkStatus
};
