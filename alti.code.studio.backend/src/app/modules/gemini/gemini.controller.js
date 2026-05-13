/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
<<<<<<< HEAD
// import { ConversationChain } from 'langchain/chains';
=======

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
import validatePromptRequest from '../../../shared/validatePromptRequest.js';
import { GeminiAiService } from './gemini.service.js';

const GeminiAiGetResponse = catchAsync(async (req, res) => {
<<<<<<< HEAD
  const { prompt, userId, sessionId, language, errorResponse } =
=======
  const { prompt, userId, sessionId, language, mode, domain, errorResponse } =
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
    await validatePromptRequest(req);

  const result = await GeminiAiService.geminiService(
    sessionId,
    prompt,
    userId,
    language,
<<<<<<< HEAD
=======
    mode,
    domain
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
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

