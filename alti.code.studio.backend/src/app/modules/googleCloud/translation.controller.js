import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { translationService } from './translation.service.js';

const translateText = catchAsync(async (req, res) => {
    const { contents, targetLanguageCode } = req.body;
    
    if (!contents || !targetLanguageCode) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'contents array and targetLanguageCode are required.' });
    }

    const translations = await translationService.translateText(contents, targetLanguageCode);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Neural Machine Translation complete.',
        data: { translations },
    });
});

const detectLanguage = catchAsync(async (req, res) => {
    const { content } = req.body;
    
    if (!content) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'content string is required.' });
    }

    const languageCode = await translationService.detectLanguage(content);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Language Detection complete.',
        data: { languageCode },
    });
});

export const TranslationController = {
    translateText,
    detectLanguage
};
