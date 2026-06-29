/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { paymentController } from './payment.controller.js';
import auth from '../../middlewares/auth/auth.js';
import { requireMfa } from '../../middlewares/requireMfa.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest/validateRequest.js';
import { paymentValidation } from './payment.validation.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
const router = express.Router();

// ── Protected Routes ──
router
  .route('/create-checkout-session')
  .post(
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.DEVELOPER),
    requireMfa,
    validateRequest(paymentValidation.createCheckoutSession),
    paymentController.createCheckoutSession,
  );

router
  .route('/admin/all')
  .get(
    auth(ENUM_USER_ROLE.ADMIN),
    requireMfa,
    paymentController.getAllSubscriptions,
  );

router
  .route('/:userId')
  .get(
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    requireMfa,
    paymentController.getSubscriptionsByUserId,
  );

// ── Stripe Webhook (must remain open — Stripe calls this) ──
router
  .route('/webhook')
  .post(
    express.raw({ type: 'application/json' }),
    paymentController.handleWebhook,
  );

export const subscriptionRoutes = router;
