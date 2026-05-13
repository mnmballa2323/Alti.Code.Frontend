/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { DevOpsAgentService } from './devOpsAgent.service.js';

const startDeployment = catchAsync(async (req, res) => {
    const result = await DevOpsAgentService.deployToCloud(req.body.provider, req.body.config);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Deployment initiated successfully',
        data: result,
    });
});

export const DevOpsAgentController = {
    startDeployment,
};
