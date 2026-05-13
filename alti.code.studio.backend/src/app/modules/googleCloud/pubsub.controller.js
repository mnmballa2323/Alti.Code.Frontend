import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { pubsubService } from './pubsub.service.js';

const publishEvent = catchAsync(async (req, res) => {
    const { topicName, payload } = req.body;
    
    if (!topicName || !payload) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'topicName and payload are required.' });
    }

    const messageId = await pubsubService.publishEvent(topicName, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Pub/Sub event published.',
        data: { messageId },
    });
});

export const PubSubController = {
    publishEvent
};
