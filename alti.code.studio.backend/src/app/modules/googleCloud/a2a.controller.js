import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { A2aService } from './a2a.service.js';
import { a2aProtocol } from './a2aProtocol.service.js';

const negotiateTask = catchAsync(async (req, res) => {
    const { remoteAgentUrl, taskData } = req.body;
    
    if (!remoteAgentUrl || !taskData) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'remoteAgentUrl and taskData are required.' });
    }

    const result = await A2aService.negotiateTask(remoteAgentUrl, taskData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'A2A Task Negotiation completed successfully.',
        data: result,
    });
});

const executeHandshake = catchAsync(async (req, res) => {
    const { endpoint, payload } = req.body;
    
    if (!endpoint || !payload) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'endpoint and payload are required.' });
    }

    const result = await a2aProtocol.executeHandshake(endpoint, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'A2A Cryptographic Handshake executed.',
        data: result,
    });
});

export const A2aController = {
    negotiateTask,
    executeHandshake
};
