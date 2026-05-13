import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { janitorService } from './janitor.service.js';

const sweepCode = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await janitorService.sweepCode(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Code sweep complete',
        data: result,
    });
});

const aggregateTodos = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await janitorService.aggregateTodos(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'TODO aggregation complete',
        data: result,
    });
});

export const janitorController = {
    sweepCode,
    aggregateTodos
};
