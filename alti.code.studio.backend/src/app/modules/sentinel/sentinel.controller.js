import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { SentinelService } from './sentinel.service.js';

const startWatch = catchAsync(async (req, res) => {
    const result = await SentinelService.startWatch();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sentinel watch started',
        data: result,
    });
});

const scanSystem = catchAsync(async (req, res) => {
    const result = await SentinelService.scanSystem();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'System scan complete',
        data: result,
    });
});

export const sentinelController = {
    startWatch,
    scanSystem
};
