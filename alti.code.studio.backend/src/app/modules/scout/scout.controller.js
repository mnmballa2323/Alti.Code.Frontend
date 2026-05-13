import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { scoutService } from './scout.service.js';

const checkUpdates = catchAsync(async (req, res) => {
    const result = await scoutService.checkUpdates();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Update check complete',
        data: result,
    });
});

const analyzeMigration = catchAsync(async (req, res) => {
    const { packageName, currentVersion, targetVersion } = req.body;
    const result = await scoutService.analyzeMigration(packageName, currentVersion, targetVersion);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Migration analysis complete',
        data: result,
    });
});

export const scoutController = {
    checkUpdates,
    analyzeMigration
};
