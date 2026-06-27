/**
 * Copyright (c) 2026 Inso Code
 *
 * knowledge.controller.js — API Controller for Knowledge & RAG Ingestion.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { KnowledgeService } from './knowledge.service.js';

const createFolder = catchAsync(async (req, res) => {
  const { name } = req.body;
  const userId = req.user?._id || req.user?.id;
  const tenantId = req.user?.tenantId;

  const folder = await KnowledgeService.createFolder(name, userId, tenantId);

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
  const { folderId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'No file uploaded.',
    });
  }

  const result = await KnowledgeService.ingestUploadedFile(file, folderId);

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

export const KnowledgeController = {
  createFolder,
  getFolders,
  deleteFolder,
  uploadFile,
  deleteFile,
};
