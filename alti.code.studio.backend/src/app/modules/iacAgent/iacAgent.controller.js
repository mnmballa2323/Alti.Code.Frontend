/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { IacAgentService } from './iacAgent.service.js';

const applyInfrastructure = catchAsync(async (req, res) => {
    const result = await IacAgentService.applyInfrastructure(req.body.tool, req.body.stackName);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Infrastructure application started',
        data: result,
    });
});

export const IacAgentController = {
    applyInfrastructure,
};
