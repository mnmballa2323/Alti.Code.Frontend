import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { cloudMarketplaceService } from './cloud_marketplace.service.js';

const resolveGcp = catchAsync(async (req, res) => {
  const { token, userId } = req.body;
  if (!token || !userId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message:
        'Both "token" (x-gcp-marketplace-token) and "userId" are required.',
    });
  }

  const result = await cloudMarketplaceService.resolveGcpEntitlement(
    token,
    userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'GCP Marketplace subscription resolved and activated successfully.',
    data: result,
  });
});

const resolveAws = catchAsync(async (req, res) => {
  const { token, userId } = req.body;
  if (!token || !userId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message:
        'Both "token" (x-amzn-marketplace-token) and "userId" are required.',
    });
  }

  const result = await cloudMarketplaceService.resolveAwsEntitlement(
    token,
    userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'AWS Marketplace subscription resolved and activated successfully.',
    data: result,
  });
});

const resolveAzure = catchAsync(async (req, res) => {
  const { token, userId } = req.body;
  if (!token || !userId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message:
        'Both "token" (azure-marketplace-token) and "userId" are required.',
    });
  }

  const result = await cloudMarketplaceService.resolveAzureEntitlement(
    token,
    userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'Azure Marketplace subscription resolved and activated successfully.',
    data: result,
  });
});

const getEntitlements = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await cloudMarketplaceService.getUserEntitlementStatus(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'User cloud marketplace entitlement status retrieved successfully.',
    data: result,
  });
});

const syncBilling = catchAsync(async (req, res) => {
  const result = await cloudMarketplaceService.processMeteredBillingBatch();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'Marketplace metered billing logs successfully synchronized with cloud providers.',
    data: result,
  });
});

export const cloudMarketplaceController = {
  resolveGcp,
  resolveAws,
  resolveAzure,
  getEntitlements,
  syncBilling,
};
