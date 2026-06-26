/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { CiCdAgentService } from './ciCdAgent.service.js';

const triggerPipeline = catchAsync(async (req, res) => {
  const result = await CiCdAgentService.triggerPipeline(
    req.body.platform,
    req.body.pipelineId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pipeline triggered successfully',
    data: result,
  });
});

export const CiCdAgentController = {
  triggerPipeline,
};
