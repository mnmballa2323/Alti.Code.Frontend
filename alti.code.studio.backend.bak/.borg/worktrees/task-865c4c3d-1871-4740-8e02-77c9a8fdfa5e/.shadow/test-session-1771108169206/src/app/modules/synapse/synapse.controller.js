import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { SynapseService } from './synapse.service.js';

const register = catchAsync(async (req, res) => {
    const result = SynapseService.registerAgent(req.body.name, req.body.capabilities, req.body.endpoint);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Agent registered to Synapse',
        data: result,
    });
});

const broadcast = catchAsync(async (req, res) => {
    const result = await SynapseService.broadcastMessage(req.body.from, req.body.type, req.body.payload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Message broadcasted',
        data: result,
    });
});

const sendDirect = catchAsync(async (req, res) => {
    const result = await SynapseService.directMessage(req.body.from, req.body.to, req.body.payload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Direct message sent',
        data: result,
    });
});

export const SynapseController = {
    register,
    broadcast,
    sendDirect
};
