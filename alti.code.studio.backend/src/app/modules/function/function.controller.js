/**
 * Copyright (c) 2026 Inso Code
 *
 * function.controller.js — API Controller for Serverless Functions Center.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { FunctionService } from './function.service.js';

const createFunction = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { name, description, code, language } = req.body;

  const result = await FunctionService.createFunction({
    name,
    description,
    code,
    language,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Serverless Function registered successfully.',
    data: result,
  });
});

const getFunctions = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  const result = await FunctionService.getFunctions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Functions fetched successfully.',
    data: result,
  });
});

const updateFunction = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { functionId } = req.params;
  const { name, description, code } = req.body;

  await FunctionService.updateFunction(functionId, { name, description, code }, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Function updated successfully.',
    data: null,
  });
});

const deleteFunction = catchAsync(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { functionId } = req.params;

  await FunctionService.deleteFunction(functionId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Function deleted successfully.',
    data: null,
  });
});

const executeFunction = catchAsync(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Code payload is required for execution.',
    });
  }

  const executionResult = await FunctionService.executeCode(code);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Execution finished.',
    data: executionResult,
  });
});

export const FunctionController = {
  createFunction,
  getFunctions,
  updateFunction,
  deleteFunction,
  executeFunction,
};
