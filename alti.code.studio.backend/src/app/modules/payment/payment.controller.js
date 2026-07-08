/**
 * Copyright (c) 2026 Inso Code
 *
 * payment.controller.js — Payment API controller for subscription handling.
 * Supports checkout sessions, SetupIntents (card + ACH), and webhooks.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { PaymentService } from './payment.service.js';

/**
 * POST /payment/create-checkout-session
 * Creates a Stripe Checkout Session for plan subscription.
 */
const createCheckoutSession = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { plan_name, planName: planNameAlt } = req.body;
  const resolvedPlanName = plan_name || planNameAlt;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
  const successUrl = req.body.successUrl || `${clientUrl}/admin/billing?checkout=success`;
  const cancelUrl = req.body.cancelUrl || `${clientUrl}/admin/plans?checkout=cancel`;

  if (!resolvedPlanName) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'plan_name is required.',
    });
  }

  const session = await PaymentService.createCheckoutSession(
    userId,
    resolvedPlanName,
    successUrl,
    cancelUrl,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Checkout session created successfully.',
    data: {
      sessionId: session.id,
      url: session.url,
    },
  });
});

/**
 * POST /payment/create-setup-intent
 * Creates a Stripe SetupIntent for saving a payment method (card or ACH).
 */
const createSetupIntent = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { payment_method_type } = req.body; // 'card' or 'us_bank_account'

  const result = await PaymentService.createSetupIntent(
    userId,
    payment_method_type || 'card',
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'SetupIntent created successfully.',
    data: {
      clientSecret: result.client_secret,
      setupIntentId: result.id,
      customerId: result.customer,
    },
  });
});

/**
 * POST /payment/webhook
 * Handles incoming Stripe webhook events.
 */
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
  createSetupIntent,
  handleWebhook,
};
