import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GcpSearchServiceInstance } from '../gcpCloud/gcpSearch.service.js';

const search = catchAsync(async (req, res) => {
  const { q, num } = req.query;
  const result = await GcpSearchServiceInstance.searchWeb(q, num);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Search results retrieved successfully',
    data: result,
  });
});

const getContext = catchAsync(async (req, res) => {
  const { q } = req.query;
  const result = await GcpSearchServiceInstance.getSearchContext(q);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Search context retrieved successfully',
    data: result,
  });
});

export const GcpSearchController = {
  search,
  getContext,
};
