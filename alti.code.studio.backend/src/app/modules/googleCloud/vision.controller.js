import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { visionService } from './vision.service.js';

const detectText = catchAsync(async (req, res) => {
    // In reality this would parse a multipart/form-data image or a GCS URI.
    // Simplifying to a base64 string for architectural completeness.
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'imageBase64 is required.' });
    }

    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const text = await visionService.detectText(imageBuffer);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Vision OCR detection completed.',
        data: { text },
    });
});

const detectLogos = catchAsync(async (req, res) => {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'imageBase64 is required.' });
    }

    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const logos = await visionService.detectLogos(imageBuffer);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Vision Logo detection completed.',
        data: { logos },
    });
});

export const VisionController = {
    detectText,
    detectLogos
};
