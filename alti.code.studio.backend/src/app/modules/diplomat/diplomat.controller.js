import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { diplomatService } from './diplomat.service.js';

const extractStrings = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await diplomatService.extractStrings(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Strings extracted successfully',
        data: result,
    });
});

const translate = catchAsync(async (req, res) => {
    const { locale, keys } = req.body;
    const result = await diplomatService.translate(locale, keys);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Translation complete',
        data: result,
    });
});

export const diplomatController = {
    extractStrings,
    translate
};
