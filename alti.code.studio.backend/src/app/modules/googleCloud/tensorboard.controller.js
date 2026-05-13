import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { tensorboardService } from './tensorboard.service.js';

const logMetric = catchAsync(async (req, res) => {
    const { experimentName, runName, metricId, value } = req.body;
    
    if (!experimentName || !runName || !metricId || value === undefined) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'experimentName, runName, metricId, and value are required.' });
    }

    await tensorboardService.logScalar(experimentName, runName, metricId, value);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Metric logged to Google Vertex TensorBoard successfully.',
    });
});

export const TensorboardController = {
    logMetric
};
