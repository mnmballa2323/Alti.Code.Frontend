import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { SecretManagerService } from './secretManager.service.js';

const getSecret = catchAsync(async (req, res) => {
    const { secretId } = req.params;
    const { versionId } = req.query;
    
    if (!secretId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'secretId is required.' });
    }

    const payload = await SecretManagerService.getSecret(secretId, versionId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Secret Manager payload retrieved.',
        data: { payload },
    });
});

const updateSecret = catchAsync(async (req, res) => {
    const { secretId, payload } = req.body;
    
    if (!secretId || !payload) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'secretId and payload are required.' });
    }

    await SecretManagerService.updateSecret(secretId, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Secret Manager version updated.',
    });
});

export const SecretManagerController = {
    getSecret,
    updateSecret
};
