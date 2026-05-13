import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { OpenHandsAgentService } from './openHandsAgent.service.js';

const startSession = catchAsync(async (req, res) => {
    const { task, workspace } = req.body;
    
    if (!task) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'task is required.' });
    }

    const result = await OpenHandsAgentService.runTask(task, workspace);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'OpenHands autonomous SWE session started.',
        data: result,
    });
});

const getSessionStatus = catchAsync(async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'sessionId is required.' });
    }

    const status = await OpenHandsAgentService.getTaskStatus(sessionId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OpenHands session status retrieved.',
        data: status,
    });
});

export const OpenHandsAgentController = {
    startSession,
    getSessionStatus,
};
