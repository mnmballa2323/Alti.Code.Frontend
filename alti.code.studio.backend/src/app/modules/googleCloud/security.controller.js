import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { sccService } from './scc.service.js';
import { gcpSentinel } from './gcpSentinel.service.js';

const reportVulnerability = catchAsync(async (req, res) => {
    const { category, resourceName, severity } = req.body;
    
    if (!category || !resourceName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'category and resourceName are required.' });
    }

    const findingName = await sccService.reportFinding(category, resourceName, severity);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Vulnerability reported to Google Security Command Center.',
        data: { findingName },
    });
});

const auditDeployment = catchAsync(async (req, res) => {
    const { payload } = req.body;
    
    if (!payload) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'payload is required.' });
    }

    const auditResult = await gcpSentinel.auditDeployment(payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'GCP Sentinel Pre-flight Audit completed.',
        data: auditResult,
    });
});

export const SecurityController = {
    reportVulnerability,
    auditDeployment
};
