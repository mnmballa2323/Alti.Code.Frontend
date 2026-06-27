/**
 * Copyright (c) 2026 Inso Code
 *
 * notification.route.js — Express routes for notification center operations.
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { NotificationController } from './notification.controller.js';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  NotificationController.getNotifications,
);

router.patch(
  '/read-all',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  NotificationController.markAllAsRead,
);

router.patch(
  '/:notificationId/read',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  NotificationController.markAsRead,
);

router.delete(
  '/:notificationId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  NotificationController.deleteNotification,
);

export const notificationRoutes = router;
