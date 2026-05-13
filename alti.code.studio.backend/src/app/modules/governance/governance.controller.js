import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { GovernorService } from './governance.service.js';

const enforcePolicy = catchAsync(async (req, res) => {
    const { code, context } = req.body;
    const result = await GovernorService.enforcePolicy(code, context);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Policy audit complete',
        data: result,
    });
});

const auditLicenses = catchAsync(async (req, res) => {
    const result = await GovernorService.auditLicenses();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'License audit complete',
        data: result,
    });
});

const generateReport = catchAsync(async (req, res) => {
    const result = await GovernorService.generateTransparencyReport();
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Report generated',
        data: result,
    });
});

const getAuditLogs = catchAsync(async (req, res) => {
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audit logs retrieved',
        data: [],
    });
});

export const governorController = {
    enforcePolicy,
    auditLicenses,
    generateReport,
    getAuditLogs
};
