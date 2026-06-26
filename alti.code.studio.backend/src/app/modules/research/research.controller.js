import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { researchService } from './research.service.js';

const executeResearch = catchAsync(async (req, res) => {
  const { objective, depth } = req.body;

  if (!objective) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Objective is required for Deep Research.',
    });
  }

  // Since this is a deep research that might take up to 30-45s for 'exhaustive',
  // the client must set a high timeout.
  const report = await researchService.executeDeepResearch(
    objective,
    depth || 'deep',
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deep Research report generated successfully.',
    data: report,
  });
});

export const ResearchController = {
  executeResearch,
};
