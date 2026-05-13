import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { apiGatewayService } from './gateway.service.js';

const createApi = catchAsync(async (req, res) => {
    const { apiId, displayName } = req.body;
    
    if (!apiId || !displayName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'apiId and displayName are required.' });
    }

    const result = await apiGatewayService.createApi(apiId, displayName);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud API Gateway autonomously created.',
        data: { gateway: result },
    });
});

export const GatewayController = {
    createApi
};
