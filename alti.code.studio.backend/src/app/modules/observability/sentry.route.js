import express from 'express';
import { SentryHealingLoopService } from './sentry_healing_loop.service.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';

const router = express.Router();

const handleSentryWebhook = catchAsync(async (req, res) => {
  const event = req.body;
  const result = await SentryHealingLoopService.handleSentryEvent(event);

  sendResponse(res, {
    statusCode: result.success ? httpStatus.OK : httpStatus.BAD_REQUEST,
    success: result.success,
    message: result.success
      ? 'Sentry crash event healed successfully.'
      : 'Sentry crash healing failed.',
    data: result,
  });
});

router.post('/event', handleSentryWebhook);

export const sentryRoutes = router;
