import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GoogleDlpService } from './dlp.service.js';

const inspectText = catchAsync(async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'text is required.' });
    }

    const findings = await GoogleDlpService.inspectText(text);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud DLP inspection completed.',
        data: { findings },
    });
});

const redactText = catchAsync(async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'text is required.' });
    }

    const redactedText = await GoogleDlpService.redactText(text);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud DLP redaction completed.',
        data: { redactedText },
    });
});

export const DlpController = {
    inspectText,
    redactText
};
