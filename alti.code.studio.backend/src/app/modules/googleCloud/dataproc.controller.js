import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { dataprocService } from './dataproc.service.js';

const ingestMonorepo = catchAsync(async (req, res) => {
    const { clusterName, pythonScriptUri } = req.body;
    
    if (!clusterName || !pythonScriptUri) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'clusterName and pythonScriptUri are required.' });
    }

    const jobResult = await dataprocService.submitIngestionJob(clusterName, pythonScriptUri);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Dataproc Apache Spark ingestion job dispatched.',
        data: jobResult,
    });
});

export const DataprocController = {
    ingestMonorepo
};
