import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { ScalingService } from './scaling.service.js';

const adjustCapacity = catchAsync(async (req, res) => {
    const { targetWorkerCount } = req.body;
    
    if (!targetWorkerCount) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'targetWorkerCount is required.' });
    }

    const result = await ScalingService.adjustSwarmCapacity(targetWorkerCount);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Run Autoscaler capacity adjusted.',
        data: result,
    });
});

export const ScalingController = {
    adjustCapacity
};
