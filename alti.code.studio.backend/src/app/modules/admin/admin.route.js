/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { requireMfa } from '../../middlewares/requireMfa.middleware.js';
import { AdminController } from './admin.controller.js';
const router = express.Router();

router.put(
  '/update-user-role/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  requireMfa,
  AdminController.updateUserRole,
);

router.delete(
  '/delete-user/:objectId',
  auth(ENUM_USER_ROLE.ADMIN),
  requireMfa,
  AdminController.deleteUser,
);

router.get(
  '/buyer/all-user',
  auth(ENUM_USER_ROLE.ADMIN),
  requireMfa,
  AdminController.getAllBuyer,
);

router.get(
  '/all-user',
  auth(ENUM_USER_ROLE.ADMIN),
  requireMfa,
  AdminController.getAllUsers,
);

router.get(
  '/all-payment',
  auth(ENUM_USER_ROLE.ADMIN),
  requireMfa,
  AdminController.getAllPayment,
);

router.get(
  '/admin/:email',
  auth(ENUM_USER_ROLE.ADMIN),
  requireMfa,
  AdminController.getAdmin,
);

router.get(
  '/all-user/statistics',
  auth(ENUM_USER_ROLE.ADMIN),
  requireMfa,
  AdminController.getUserStatisticsByMonth,
);

export const adminRoutes = router;
