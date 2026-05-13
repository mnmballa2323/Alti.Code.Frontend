import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { surgeonService } from './surgeon.service.js';
import { autonomicService } from './autonomic.service.js';

const applyPattern = catchAsync(async (req, res) => {
    const { filePath, pattern, context } = req.body;
    const result = await surgeonService.applyPattern(filePath, pattern, context);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Refactoring complete',
        data: result,
    });
});

const analyzeComplexity = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await surgeonService.analyzeComplexity(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Complexity analysis complete',
        data: result,
    });
});

const triggerAutonomicSweep = catchAsync(async (req, res) => {
    const { targetFiles } = req.body;
    const result = await autonomicService.commenceProactiveSweep(targetFiles);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Autonomic AST sweep and refactor complete',
        data: result,
    });
});

export const surgeonController = {
    applyPattern,
    analyzeComplexity,
    triggerAutonomicSweep
};
