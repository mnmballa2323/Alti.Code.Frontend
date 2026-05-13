import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { kmsService } from './kms.service.js';

const encryptPayload = catchAsync(async (req, res) => {
    const { plaintext } = req.body;
    
    if (!plaintext) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'plaintext is required.' });
    }

    const ciphertext = await kmsService.encryptPayload(plaintext);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payload encrypted via Google Cloud KMS HSM.',
        data: { ciphertext },
    });
});

const decryptPayload = catchAsync(async (req, res) => {
    const { ciphertext } = req.body;
    
    if (!ciphertext) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'ciphertext is required.' });
    }

    const plaintext = await kmsService.decryptPayload(ciphertext);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payload decrypted via Google Cloud KMS HSM.',
        data: { plaintext },
    });
});

export const KmsController = {
    encryptPayload,
    decryptPayload
};
