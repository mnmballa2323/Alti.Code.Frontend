import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { earService } from './ear.service.js';

const transcribeCommand = catchAsync(async (req, res) => {
    // In reality this would parse a multipart/form-data audio file.
    // Simplifying to a base64 string for architectural completeness.
    const { audioBase64 } = req.body;
    
    if (!audioBase64) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'audioBase64 is required.' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const transcription = await earService.transcribeCommand(audioBuffer);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Speech-to-Text auditory command decoded.',
        data: { transcription },
    });
});

export const EarController = {
    transcribeCommand
};
