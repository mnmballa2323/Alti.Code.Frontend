/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import mongoose from 'mongoose';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { checkUsageLimits } from '../../middlewares/checkUsageLimits/checkUsageLimits.js';
import UserModel from '../auth/auth.model.js';
import { UserRepository } from '../auth/prisma.user.repository.js';
import SubscriptionModel from './payment.model.js';
import { PaymentService } from './payment.service.js';
// import { checkFreePlanLimits } from '../../middlewares/checkFreePlanLimits/checkFreePlanLimits.js';
import { checkFreePlanLimits } from '../../middlewares/checkFreePlanLimits/checkFreePlanLimits.js';

const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { plan_name, price, duration, userId } = req.body;

  // Auth middleware sets req.user from JWT (contains _id, role but NOT email).
  // Stripe needs the full user doc with email, so always fetch from DB.
  const lookupId = req.user?._id || userId;

  if (!lookupId) {
    return res.status(400).json({ error: 'User identification required' });
  }

  // Try Prisma (primary DB) first, fall back to Mongoose
  let user = await UserRepository.findById(lookupId);
  if (!user) {
    try {
      user = await UserModel.findById(lookupId);
    } catch (_castErr) {
      // UUID from Prisma can't be cast to MongoDB ObjectId — expected
    }
  }
  if (!user) return res.status(404).json({ error: 'User not found' });

  const plan = {
    plan_name: plan_name || req.body.plan?.plan_name,
    price: price || req.body.plan?.price,
    duration: duration || req.body.plan?.duration || 'year',
  };

  const sessionUrl = await PaymentService.createCheckoutSessionService(
    user,
    plan,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Checkout session created successfully',
    data: { url: sessionUrl },
  });
});

const handleWebhook = catchAsync(async (req, res, next) => {
  await PaymentService.handleWebhookService(req, res);
});

const getAllSubscriptions = catchAsync(async (req, res, next) => {
  const subscriptions = await SubscriptionModel.find({}).sort({
    createdAt: -1,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All subscriptions fetched successfully',
    data: subscriptions,
  });
});

const getSubscriptionsByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const subscriptions = await SubscriptionModel.find({ userId })
    .populate('userId', 'email')
    .sort({ createdAt: -1 });

  if (!subscriptions.length) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'No subscriptions found for this user',
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User subscriptions fetched successfully',
    data: subscriptions,
  });
});

const incrementPromptsUsed = async userId => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // const user = await checkFreePlanLimits(userId, 'prompt').session(session);
    const user = await checkFreePlanLimits(userId, 'prompt', session);

    if (user.isSubscribed) {
      const subscription = await checkUsageLimits(userId);
      console.log('Subscription check result:', subscription);

      if (!subscription || !subscription._id) {
        throw new Error('Subscription not found or invalid.');
      }

      await SubscriptionModel.updateOne(
        { _id: subscription._id },
        { $inc: { 'usage.promptsUsed': 1 } },
        { session },
      );
    } else {
      user.freePlanUsage.promptsUsed += 1;
      await user.save({ session });
    }

    await session.commitTransaction();
    return { success: true, message: 'Prompt usage updated successfully.' };
  } catch (error) {
    console.error('Error in incrementPromptsUsed:', error);
    await session.abortTransaction();
    return { success: false, message: error.message };
  } finally {
    session.endSession();
  }
};

const incrementImagesUsed = async userId => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // const user = await checkFreePlanLimits(userId, 'image').session(session);
    const user = await checkFreePlanLimits(userId, 'prompt', session);

    if (user.isSubscribed) {
      const subscription = await checkUsageLimits(userId);
      // console.log("Subscription check result:", subscription);

      if (!subscription || !subscription._id) {
        throw new Error('Subscription not found or invalid.');
      }

      await SubscriptionModel.updateOne(
        { _id: subscription._id },
        { $inc: { 'usage.imagesUsed': 1 } },
        { session },
      );
    } else {
      user.freePlanUsage.imagesUsed += 1;
      await user.save({ session });
    }

    await session.commitTransaction();
    return { success: true, message: 'Image usage updated successfully.' };
  } catch (error) {
    console.error('Error in incrementImagesUsed:', error);
    await session.abortTransaction();
    return {
      success: false,
      message: error.message || 'An error occurred while updating image usage.',
    };
  } finally {
    session.endSession();
  }
};

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
  getAllSubscriptions,
  getSubscriptionsByUserId,
  incrementPromptsUsed,
  incrementImagesUsed,
};
