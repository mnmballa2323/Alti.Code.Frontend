import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { videoEyeService } from './video_eye.service.js';

const analyzeVideo = catchAsync(async (req, res) => {
    const { gcsUri } = req.body;
    
    if (!gcsUri) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'gcsUri is required.' });
    }

    const detectedText = await videoEyeService.analyzeBugRecording(gcsUri);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Video Intelligence analysis completed.',
        data: { detectedText },
    });
});

export const VideoEyeController = {
    analyzeVideo
};
