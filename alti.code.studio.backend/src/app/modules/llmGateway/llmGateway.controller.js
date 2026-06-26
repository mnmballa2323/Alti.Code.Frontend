import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { LlmGatewayService } from './llmGateway.service.js';
import validatePromptRequest from '../../../shared/validatePromptRequest.js';

const getResponse = catchAsync(async (req, res) => {
  // Reuses validatePromptRequest helper for consistency
  const { prompt, userId, sessionId, model } = await validatePromptRequest(req);

  const result = await LlmGatewayService.routeCompletion(
    userId,
    sessionId,
    prompt,
    model,
    req.body?.temperature,
    req.body?.domain,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Prompt processed successfully through secure LLM Gateway.',
    data: result,
  });
});

export const LlmGatewayController = {
  getResponse,
};
