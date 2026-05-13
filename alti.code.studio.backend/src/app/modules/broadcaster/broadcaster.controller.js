import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { BroadcasterService } from './broadcaster.service.js';

const sendSlack = catchAsync(async (req, res) => {
    const { message } = req.body;
    const result = await BroadcasterService.sendSlack(message);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Slack Message Processed',
        data: result,
    });
});

const sendDiscord = catchAsync(async (req, res) => {
    const { message } = req.body;
    const result = await BroadcasterService.sendDiscord(message);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Discord Message Processed',
        data: result,
    });
});

const sendEmail = catchAsync(async (req, res) => {
    const { to, subject, body } = req.body;
    const result = await BroadcasterService.sendEmail(to, subject, body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Email Processed',
        data: result,
    });
});

const broadcast = catchAsync(async (req, res) => {
    const { alert } = req.body;
    const result = await BroadcasterService.broadcastAlert(alert);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Broadcast Sent',
        data: result,
    });
});

export const broadcasterController = {
    sendSlack,
    sendDiscord,
    sendEmail,
    broadcast
};
