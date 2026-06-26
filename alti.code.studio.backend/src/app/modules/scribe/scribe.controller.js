import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { ScribeService } from './scribe.service.js';

const documentCode = catchAsync(async (req, res) => {
  const { code, filename } = req.body;
  const result = await ScribeService.documentCode(code, filename);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Code Documented',
    data: result,
  });
});

const updateWiki = catchAsync(async (req, res) => {
  const { topic, context } = req.body;
  const result = await ScribeService.updateWiki(topic, context);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Wiki Updated',
    data: result,
  });
});

export const scribeController = {
  documentCode,
  updateWiki,
};
