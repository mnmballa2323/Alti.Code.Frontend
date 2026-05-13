import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
// iap.service.js mainly exports middleware, but we can have a controller for explicit verification/info
import { iapService } from './iap.service.js';

const verifyIdentity = catchAsync(async (req, res) => {
    // If we reach this controller, the IAP middleware has already validated the token
    // and attached req.user
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Identity-Aware Proxy Verification Successful.',
        data: { user: req.user },
    });
});

export const IapController = {
    verifyIdentity
};
