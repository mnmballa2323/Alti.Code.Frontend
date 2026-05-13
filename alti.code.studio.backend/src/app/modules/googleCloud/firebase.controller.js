import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { firebaseService } from './firebase.service.js';

const streamEvent = catchAsync(async (req, res) => {
    const { channel, payload } = req.body;
    
    if (!channel || !payload) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'channel and payload are required.' });
    }

    await firebaseService.streamEvent(channel, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Real-time event streamed via Firebase.',
    });
});

const sendPushNotification = catchAsync(async (req, res) => {
    const { deviceToken, title, body } = req.body;
    
    if (!deviceToken || !title || !body) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'deviceToken, title, and body are required.' });
    }

    const response = await firebaseService.sendPushNotification(deviceToken, title, body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Firebase Cloud Messaging push notification dispatched.',
        data: response,
    });
});

export const FirebaseController = {
    streamEvent,
    sendPushNotification
};
