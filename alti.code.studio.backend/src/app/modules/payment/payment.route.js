/**
 * Copyright (c) 2026 Inso Code
 *
 * payment.route.js — API routing for Stripe billing, checkout, and payment methods.
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { PaymentController } from './payment.controller.js';

const router = express.Router();

// Create a Stripe Checkout Session for plan subscription
router.post(
  '/checkout/create-session',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  PaymentController.createCheckoutSession,
);

// Alias: frontend calls this path from the Plans page
router.post(
  '/create-checkout-session',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  PaymentController.createCheckoutSession,
);

// Create a SetupIntent for saving a payment method (card or ACH)
router.post(
  '/create-setup-intent',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  PaymentController.createSetupIntent,
);

export const paymentRoutes = router;
