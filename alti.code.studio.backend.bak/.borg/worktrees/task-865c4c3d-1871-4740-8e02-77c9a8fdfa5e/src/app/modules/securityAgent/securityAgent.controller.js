/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { SecurityAgentService } from './securityAgent.service.js';

const startAudit = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const sessionId = `security-audit-${Date.now()}`;
    const result = await SecurityAgentService.auditCodebase(req.body.repoPath, userId, sessionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Security audit completed successfully',
        data: result,
    });
});

export const SecurityAgentController = {
    startAudit,
};
