import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GcsService } from './gcs.service.js';

const uploadFile = catchAsync(async (req, res) => {
    const { bucketName, fileName, content } = req.body;
    
    if (!bucketName || !fileName || !content) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'bucketName, fileName, and content are required.' });
    }

    const gcsUri = await GcsService.uploadFile(bucketName, fileName, content);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'File uploaded to Google Cloud Storage.',
        data: { gcsUri },
    });
});

const getSignedUrl = catchAsync(async (req, res) => {
    const { bucketName, fileName } = req.query;
    
    if (!bucketName || !fileName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'bucketName and fileName are required.' });
    }

    const url = await GcsService.getSignedUrl(bucketName, fileName);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Signed URL generated.',
        data: { url },
    });
});

export const GcsController = {
    uploadFile,
    getSignedUrl
};
