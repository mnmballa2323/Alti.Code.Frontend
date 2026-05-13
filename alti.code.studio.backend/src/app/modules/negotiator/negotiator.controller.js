import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { negotiatorService } from './negotiator.service.js';

const scaffoldIntegration = catchAsync(async (req, res) => {
    const { serviceName, description } = req.body;
    const result = await negotiatorService.scaffoldIntegration(serviceName, description);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Integration scaffolded successfully',
        data: result,
    });
});

const generateMock = catchAsync(async (req, res) => {
    const { serviceName } = req.body;
    const result = await negotiatorService.generateMock(serviceName);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Mock generated successfully',
        data: result,
    });
});

const createWebhookHandler = catchAsync(async (req, res) => {
    const { serviceName } = req.body;
    const result = await negotiatorService.createWebhookHandler(serviceName);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Webhook handler created successfully',
        data: result,
    });
});

export const negotiatorController = {
    scaffoldIntegration,
    generateMock,
    createWebhookHandler
};
