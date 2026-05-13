import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { sccService } from './scc.service.js';

const reportVulnerability = catchAsync(async (req, res) => {
    const { category, resourceName, severity } = req.body;
    
    if (!category || !resourceName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'category and resourceName are required.' });
    }

    const findingName = await sccService.reportFinding(category, resourceName, severity);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Security Command Center finding reported.',
        data: { findingName },
    });
});

export const SccController = {
    reportVulnerability
};
