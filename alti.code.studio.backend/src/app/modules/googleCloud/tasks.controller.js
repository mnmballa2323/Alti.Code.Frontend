import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { cloudTasksService } from './tasks.service.js';

const dispatchTask = catchAsync(async (req, res) => {
    const { endpoint, payload, inSeconds } = req.body;
    
    if (!endpoint || !payload) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'endpoint and payload are required.' });
    }

    const result = await cloudTasksService.dispatchAgentJob(endpoint, payload, inSeconds);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Task dispatched to Google Cloud Tasks.`,
        data: result,
    });
});

export const TasksController = {
    dispatchTask
};
