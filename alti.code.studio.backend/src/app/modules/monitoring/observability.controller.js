import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { observabilityService } from './observability.service.js';

const getRecentTraces = catchAsync(async (req, res) => {
    const traces = observabilityService.getRecentTraces();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Traces retrieved successfully',
        data: traces,
    });
});

export const observabilityController = {
    getRecentTraces
};
