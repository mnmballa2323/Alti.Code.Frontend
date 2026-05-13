import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GoogleCloudRunService } from './cloudRun.service.js';

const executeJob = catchAsync(async (req, res) => {
    const { jobId, image, envVars, secretIds } = req.body;
    
    // In a real scenario, we might want to validate that the user has permissions
    // to spawn a Cloud Run Job, but for this enterprise iteration, the swarm handles it.
    const result = await GoogleCloudRunService.executeCodingJob(jobId, image, envVars, secretIds);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cloud Run Sandbox Job dispatched securely.',
        data: result,
    });
});

export const CloudRunController = {
    executeJob
};
