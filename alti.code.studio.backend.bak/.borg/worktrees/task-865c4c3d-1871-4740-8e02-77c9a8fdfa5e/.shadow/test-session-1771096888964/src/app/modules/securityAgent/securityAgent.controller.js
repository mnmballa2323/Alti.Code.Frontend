import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { SecurityAgentService } from './securityAgent.service.js';

const startAudit = catchAsync(async (req, res) => {
    const result = await SecurityAgentService.auditCodebase(req.body.repoPath);
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
