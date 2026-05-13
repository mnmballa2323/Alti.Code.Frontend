/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { auditService } from '../compliance/audit.service.js';

const getAuditLogs = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await auditService.getLogs(limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audit logs retrieved successfully',
        data: logs,
    });
});

export const GovernanceController = {
    getAuditLogs
};
