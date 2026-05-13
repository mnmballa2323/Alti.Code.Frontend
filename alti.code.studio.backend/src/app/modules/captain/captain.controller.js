import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { CaptainService } from './captain.service.js';

const checkHealth = catchAsync(async (req, res) => {
    const result = await CaptainService.checkHealth();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Health Check Completed',
        data: result,
    });
});

const getStatus = catchAsync(async (req, res) => {
    const result = await CaptainService.getStatus();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'System Status Retrieved',
        data: result,
    });
});

const emergency = catchAsync(async (req, res) => {
    const { level, reason } = req.body;
    const result = await CaptainService.declareEmergency(level, reason);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Emergency Declared',
        data: result,
    });
});

export const captainController = {
    checkHealth,
    getStatus,
    emergency
};
