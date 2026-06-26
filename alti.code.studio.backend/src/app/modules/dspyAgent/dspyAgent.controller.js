import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { DspyAgentService } from './dspyAgent.service.js';

const compilePrompt = catchAsync(async (req, res) => {
  const { task, examples } = req.body;

  if (!task || !examples || !Array.isArray(examples)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'task and an array of examples are required.',
    });
  }

  const result = await DspyAgentService.optimizePrompt(task, examples);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'DSPy algorithmic prompt compiled and optimized.',
    data: result,
  });
});

export const DspyAgentController = {
  compilePrompt,
};
