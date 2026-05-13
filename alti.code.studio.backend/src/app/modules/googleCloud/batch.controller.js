import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { cloudBatchService } from './cloud_batch.service.js';

const executeMassiveIngestionJob = catchAsync(async (req, res) => {
    const { repositoryUrl, coreCount } = req.body;
    
    if (!repositoryUrl) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'repositoryUrl is required.' });
    }

    const jobName = await cloudBatchService.executeMassiveIngestionJob(repositoryUrl, coreCount);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Google Cloud Batch HPC job submitted. Unbounded cores provisioned.`,
        data: { jobName },
    });
});

export const BatchController = {
    executeMassiveIngestionJob
};
