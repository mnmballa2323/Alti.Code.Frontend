/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';

import validatePromptRequest from '../../../shared/validatePromptRequest.js';
import { GeminiAiService } from './gemini.service.js';

const GeminiAiGetResponse = catchAsync(async (req, res) => {
  const { prompt, userId, sessionId, language, mode, domain, errorResponse } =
    await validatePromptRequest(req);

  const result = await GeminiAiService.geminiService(
    sessionId,
    prompt,
    userId,
    language,
    mode,
    domain
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Response processed successfully.',
    data: result,
  });
});
const Gemini25PreviewAiGetResponse = catchAsync(async (req, res) => {
  const { prompt, userId, sessionId, errorResponse } =
    await validatePromptRequest(req);

  const result = await GeminiAiService.gemini25PreviewService(
    sessionId,
    prompt,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Response processed successfully.',
    data: result,
  });
});

const GeminiMultimodalResponse = catchAsync(async (req, res) => {
  const { base64Image, mimeType, textPrompt, sessionId } = req.body;
  if (!base64Image || !mimeType) {
    return res.status(400).json({ error: 'base64Image and mimeType are required.' });
  }
  const reply = await GeminiAiService.generateContentWithImage(
    base64Image,
    mimeType,
    textPrompt || 'Describe this image in detail.',
    sessionId || '_multimodal',
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Multimodal response processed.',
    data: { reply },
  });
});

export const GeminiAiController = {
  GeminiAiGetResponse,
  Gemini25PreviewAiGetResponse,
  GeminiMultimodalResponse,
};

