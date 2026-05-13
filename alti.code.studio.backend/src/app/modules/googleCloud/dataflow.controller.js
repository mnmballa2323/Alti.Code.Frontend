import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { dataflowService } from './dataflow.service.js';

const launchIngestionPipeline = catchAsync(async (req, res) => {
    const { repoUrl, commitHash } = req.body;
    
    if (!repoUrl || !commitHash) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'repoUrl and commitHash are required.' });
    }

    const job = await dataflowService.triggerRealTimeIngestion(repoUrl, commitHash);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Dataflow (Apache Beam) pipeline launched.',
        data: { job },
    });
});

export const DataflowController = {
    launchIngestionPipeline
};
