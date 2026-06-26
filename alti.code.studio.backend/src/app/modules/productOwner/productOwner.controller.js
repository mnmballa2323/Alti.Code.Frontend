import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { productOwnerService } from './productOwner.service.js';

const analyzeRequest = catchAsync(async (req, res) => {
  const { request } = req.body;
  const result = await productOwnerService.analyze(request);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product Owner Analysis Complete',
    data: result,
  });
});

const generateStories = catchAsync(async (req, res) => {
  const { featureName, description } = req.body;
  const result = await productOwnerService.createStories(
    featureName,
    description,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Stories Generated',
    data: result,
  });
});

const addToBacklog = catchAsync(async (req, res) => {
  const result = await productOwnerService.addToBacklog(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Item added to backlog',
    data: result,
  });
});

const commissionSpec = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productOwnerService.commissionSpec(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Spec commissioned successfully',
    data: result,
  });
});

export const productOwnerController = {
  analyzeRequest,
  generateStories,
  addToBacklog,
  commissionSpec,
};
