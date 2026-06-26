import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { VaultService } from './vault.service.js';
import ApiError from '../../../errors/ApiError.js';

const getKeys = catchAsync(async (req, res) => {
  let userId = req.user?._id || req.user?.id;

  // In local development, fallback if no user context is loaded
  if (!userId && process.env.NODE_ENV !== 'production') {
    // Use a default seed user ID for local dev sandbox
    const { prisma } = await import('../../../config/prisma.js');
    const defaultUser = await prisma.user.findFirst();
    userId = defaultUser?.id || '00000000-0000-0000-0000-000000000000';
  }

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication is required.');
  }

  const result = await VaultService.getMaskedCredentials(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Credentials retrieved securely.',
    data: result,
  });
});

const updateKeys = catchAsync(async (req, res) => {
  let userId = req.user?._id || req.user?.id;

  // In local development, fallback if no user context is loaded
  if (!userId && process.env.NODE_ENV !== 'production') {
    const { prisma } = await import('../../../config/prisma.js');
    const defaultUser = await prisma.user.findFirst();
    userId = defaultUser?.id || '00000000-0000-0000-0000-000000000000';
  }

  if (!userId) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Authentication is required to store credentials.',
    );
  }

  const result = await VaultService.updateCredentials(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Credentials updated and encrypted successfully.',
    data: result,
  });
});

export const VaultController = {
  getKeys,
  updateKeys,
};
