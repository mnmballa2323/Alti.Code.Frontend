import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { AnalystService } from './analyst.service.js';

const analyzeTraffic = catchAsync(async (req, res) => {
  const result = await AnalystService.analyzeTraffic();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Traffic Analysis Complete',
    data: result,
  });
});

const predictLoad = catchAsync(async (req, res) => {
  const result = await AnalystService.predictLoad();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Load Prediction Complete',
    data: result,
  });
});

export const analystController = {
  analyzeTraffic,
  predictLoad,
};
