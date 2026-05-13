import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { speechClient } from './speech.service.js';

const recognizeSpeech = catchAsync(async (req, res) => {
    // Note: Audio content should be handled via multipart/form-data.
    // Abstracting to base64 for architectural completeness.
    const { audioBase64 } = req.body;
    
    if (!audioBase64) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'audioBase64 is required.' });
    }

    const request = {
        audio: { content: audioBase64 },
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Speech-to-Text completed.',
        data: { transcription },
    });
});

export const SpeechController = {
    recognizeSpeech
};
