import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { chronService } from './chron.service.js';

const scheduleJob = catchAsync(async (req, res) => {
    const { jobId, schedule, targetUrl } = req.body;
    
    if (!jobId || !schedule || !targetUrl) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'jobId, schedule, and targetUrl are required.' });
    }

    const job = await chronService.scheduleAutonomousJob(jobId, schedule, targetUrl);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Scheduler job created. Temporal autonomy activated.',
        data: { job },
    });
});

export const ChronController = {
    scheduleJob
};
