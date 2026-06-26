import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { ultimateRagService } from './ultimate_rag.service.js';

const executeUltimateRag = catchAsync(async (req, res) => {
  const { query, mode, domain, language } = req.body;

  if (!query) {
    throw new Error('Query is required to execute the Ultimate RAG sequence.');
  }

  const result = await ultimateRagService.synthesize(
    query,
    mode,
    domain,
    language,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ultimate Google RAG Synthesis Complete.',
    data: result,
  });
});

export const UltimateRagController = {
  executeUltimateRag,
};
