import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { sentimentService } from './sentiment.service.js';

const analyzeSentiment = catchAsync(async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'text is required.' });
    }

    const analysis = await sentimentService.analyzeFrustration(text);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Natural Language sentiment analysis completed.',
        data: analysis,
    });
});

export const SentimentController = {
    analyzeSentiment
};
