import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { ttsService } from './tts.service.js';

const synthesizeSpeech = catchAsync(async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Text is required for synthesis.' });
    }

    const audioBuffer = await ttsService.synthesizeSpeech(text);
    
    // We can return the buffer directly or encode as base64
    const audioBase64 = audioBuffer.toString('base64');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google TTS Neural synthesis complete.',
        data: { audioBase64 },
    });
});

export const TtsController = {
    synthesizeSpeech
};
