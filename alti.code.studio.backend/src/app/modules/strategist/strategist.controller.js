import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { StrategistService } from './strategist.service.js';

const optimize = catchAsync(async (req, res) => {
  const { plan } = req.body;
  const result = await StrategistService.optimize(plan);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Plan Optimized',
    data: result,
  });
});

const analyze = catchAsync(async (req, res) => {
  const result = await StrategistService.analyze();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Analysis Complete',
    data: result,
  });
});

export const strategistController = {
  optimize,
  analyze,
};
