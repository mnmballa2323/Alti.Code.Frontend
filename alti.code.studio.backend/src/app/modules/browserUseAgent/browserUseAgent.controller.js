import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { BrowserUseAgentService } from './browserUseAgent.service.js';

const runAutomation = catchAsync(async (req, res) => {
  const { task } = req.body;

  if (!task) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: 'task is required.' });
  }

  const result = await BrowserUseAgentService.runBrowserTask(task);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Browser-Use automation task started.',
    data: result,
  });
});

const getStatus = catchAsync(async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: 'taskId is required.' });
  }

  const status = await BrowserUseAgentService.getBrowserTaskStatus(taskId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Browser-Use task status retrieved.',
    data: status,
  });
});

export const BrowserUseAgentController = {
  runAutomation,
  getStatus,
};
