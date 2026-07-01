/**
 * Copyright (c) 2026 Inso Code
 *
 * payment.route.js — API routing for authenticated checkout sessions.
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { PaymentController } from './payment.controller.js';

const router = express.Router();

router.post(
  '/checkout/create-session',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  PaymentController.createCheckoutSession,
);

export const paymentRoutes = router;
