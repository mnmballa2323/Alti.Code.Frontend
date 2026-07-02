/**
 * Copyright (c) 2026 Inso Code
 *
 * knowledge.controller.js — API Controller for Knowledge & RAG Ingestion.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { KnowledgeService } from './knowledge.service.js';
import { NotificationService } from '../notification/notification.service.js';

const createFolder = catchAsync(async (req, res) => {
  const { name } = req.body;
  const userId = req.user?._id || req.user?.id;
  const tenantId = req.user?.tenantId;
  const folder = await KnowledgeService.createFolder(name, userId, tenantId);

  // Send real-time notification for folder creation
  if (userId) {
    await NotificationService.createNotification({
      userId,
      title: 'New Folder Created',
      message: `Folder "${name}" was successfully created in your Knowledge Catalog.`,
      type: 'info',
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Folder created successfully.',
    data: folder,
  });
});

const getFolders = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const tenantId = req.user?.tenantId;

  const folders = await KnowledgeService.getFolders(userId, tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Folders fetched successfully.',
    data: folders,
  });
});

const deleteFolder = catchAsync(async (req, res) => {
  const { folderId } = req.params;

  await KnowledgeService.deleteFolder(folderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Folder deleted successfully.',
    data: null,
  });
});

const uploadFile = catchAsync(async (req, res) => {
  let { folderId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'No file uploaded.',
    });
  }

  // If no folderId provided, use or create a default "Data" folder
  if (!folderId) {
    const userId = req.user?._id || req.user?.id;
    const tenantId = req.user?.tenantId;
    const defaultFolder = await KnowledgeService.getOrCreateDefaultFolder(
      userId,
      tenantId,
    );
    folderId = defaultFolder.id;
  }

  const result = await KnowledgeService.ingestUploadedFile(file, folderId);
  const userId = req.user?._id || req.user?.id;

  // Send real-time notification for successful file parsing & ingestion
  if (userId) {
    await NotificationService.createNotification({
      userId,
      title: 'Document Ingestion Complete',
      message: `"${file.originalname}" has been successfully parsed and indexed into your RAG memory.`,
      type: 'success',
      actionUrl: `/knowledge`,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'File uploaded and indexed successfully.',
    data: result,
  });
});

const deleteFile = catchAsync(async (req, res) => {
  const { fileId } = req.params;

  await KnowledgeService.deleteFile(fileId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File deleted successfully.',
    data: null,
  });
});

const getAllFiles = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const tenantId = req.user?.tenantId;

  const files = await KnowledgeService.getAllFiles(userId, tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Files fetched successfully.',
    data: files,
  });
});

export const KnowledgeController = {
  createFolder,
  getFolders,
  deleteFolder,
  uploadFile,
  deleteFile,
  getAllFiles,
};
