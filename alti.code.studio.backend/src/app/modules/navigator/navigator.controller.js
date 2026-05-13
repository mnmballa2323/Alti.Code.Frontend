import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { NavigatorService } from './navigator.service.js';

const scale = catchAsync(async (req, res) => {
    const { load } = req.body;
    const result = await NavigatorService.scale(load);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Scaling Operation Complete',
        data: result,
    });
});

const optimize = catchAsync(async (req, res) => {
    const result = await NavigatorService.optimize();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cost Optimization Complete',
        data: result,
    });
});

export const navigatorController = {
    scale,
    optimize
};
