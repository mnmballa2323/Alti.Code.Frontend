import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { voiceService } from './voice.service.js';

const synthesizeSpeech = catchAsync(async (req, res) => {
    const { text, outputFilename } = req.body;
    
    if (!text) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'text is required.' });
    }

    const audioUrl = await voiceService.synthesizeThought(text, outputFilename);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Text-to-Speech WaveNet synthesis completed.',
        data: { audioUrl },
    });
});

export const VoiceController = {
    synthesizeSpeech
};
