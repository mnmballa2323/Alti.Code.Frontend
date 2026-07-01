/**
 * Copyright (c) 2026 Inso Code
 *
 * payment.controller.js — Payment API controller for subscription handling.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { PaymentService } from './payment.service.js';

const createCheckoutSession = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { planName, successUrl, cancelUrl } = req.body;

  if (!planName || !successUrl || !cancelUrl) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'planName, successUrl, and cancelUrl are required.',
    });
  }

  const session = await PaymentService.createCheckoutSession(
    userId,
    planName,
    successUrl,
    cancelUrl,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Checkout session created successfully.',
    data: {
      sessionId: session.id,
      checkoutUrl: session.url,
    },
  });
});

const handleWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const rawBody = req.body;

  const result = await PaymentService.handleWebhook(rawBody, signature);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook processed successfully.',
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
};
