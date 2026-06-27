/**
 * Copyright (c) 2026 Inso Code
 *
 * notification.controller.js — Controller for handling Notification REST endpoints.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { NotificationService } from './notification.service.js';

const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  const result = await NotificationService.getNotifications(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications fetched successfully.',
    data: result,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { notificationId } = req.params;

  await NotificationService.markAsRead(notificationId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read successfully.',
    data: null,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read.',
    data: null,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { notificationId } = req.params;

  await NotificationService.deleteNotification(notificationId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification deleted successfully.',
    data: null,
  });
});

export const NotificationController = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
