import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { spannerService } from './spanner.service.js';

const getUserSessions = catchAsync(async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'userId is required.' });
    }

    const sessions = await spannerService.getUserSessions(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Spanner query executed successfully.',
        data: sessions,
    });
});

export const SpannerController = {
    getUserSessions
};
