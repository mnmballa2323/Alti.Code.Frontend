import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { detectiveService } from './detective.service.js';

const auditCodebase = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await detectiveService.auditCodebase(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Security audit complete',
        data: result,
    });
});

const analyzeLogs = catchAsync(async (req, res) => {
    const { logs } = req.body;
    const result = await detectiveService.analyzeLogs(logs);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Log analysis complete',
        data: result,
    });
});

const checkDependencies = catchAsync(async (req, res) => {
    const result = await detectiveService.checkDependencies();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dependency check complete',
        data: result,
    });
});

export const detectiveController = {
    auditCodebase,
    analyzeLogs,
    checkDependencies
};
