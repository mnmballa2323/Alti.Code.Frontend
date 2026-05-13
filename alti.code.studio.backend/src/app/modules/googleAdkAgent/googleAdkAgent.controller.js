import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GoogleAdkAgentService } from './googleAdkAgent.service.js';

const executeTask = catchAsync(async (req, res) => {
    const { task } = req.body;
    
    if (!task) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'task payload is required.' });
    }

    const result = await GoogleAdkAgentService.executeGoAgent(task);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Agent Development Kit (ADK) Go Agent executed.',
        data: result,
    });
});

export const GoogleAdkAgentController = {
    executeTask
};
