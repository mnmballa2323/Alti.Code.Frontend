import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { painterService } from './painter.service.js';

const paintComponent = catchAsync(async (req, res) => {
  const { description } = req.body;
  const result = await painterService.paintComponent(description);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Component painted successfully',
    data: result,
  });
});

export const painterController = {
  paintComponent,
};
