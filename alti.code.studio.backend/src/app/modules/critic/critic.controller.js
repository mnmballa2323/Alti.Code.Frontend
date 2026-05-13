import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { criticService } from './critic.service.js';

const generateTest = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await criticService.generateTest(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Test generated successfully',
        data: result,
    });
});

const runTests = catchAsync(async (req, res) => {
    const { testPattern } = req.body;
    const result = await criticService.runTests(testPattern);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Test execution complete',
        data: result,
    });
});

const reviewCode = catchAsync(async (req, res) => {
    const { code } = req.body;
    const result = await criticService.reviewCode(code);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Code review complete',
        data: result,
    });
});

export const criticController = {
    generateTest,
    runTests,
    reviewCode
};
