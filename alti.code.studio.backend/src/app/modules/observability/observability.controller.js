import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { ObservabilityService } from './observability.service.js';

const getSwarmTelemetry = catchAsync(async (req, res) => {
  const result = await ObservabilityService.getSwarmTelemetry();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Swarm observability metrics compiled successfully',
    data: result,
  });
});

export const ObservabilityController = {
  getSwarmTelemetry,
};
