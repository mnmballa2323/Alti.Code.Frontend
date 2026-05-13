import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { BigQueryService } from './bigquery.service.js';

const runAnalysis = catchAsync(async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'query is required.' });
    }

    const rows = await BigQueryService.runProductivityAnalysis(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud BigQuery analysis executed successfully.',
        data: rows,
    });
});

export const BigQueryController = {
    runAnalysis
};
