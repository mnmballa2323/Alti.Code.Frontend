import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { LiaisonService } from './liaison.service.js';

const webhook = catchAsync(async (req, res) => {
  const { source } = req.params;
  const payload = req.body;

  const result = await LiaisonService.handleWebhook(source, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook Received',
    data: result,
  });
});

export const liaisonController = {
  webhook,
};
