import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { FazmAgentService } from './fazmAgent.service.js';

const runAutomation = catchAsync(async (req, res) => {
    const { task } = req.body;
    
    if (!task) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'task is required.' });
    }

    const result = await FazmAgentService.runTask(task);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Fazm automation task started.',
        data: result,
    });
});

const getStatus = catchAsync(async (req, res) => {
    const { taskId } = req.params;

    if (!taskId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'taskId is required.' });
    }

    const status = await FazmAgentService.getStatus(taskId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Fazm task status retrieved.',
        data: status,
    });
});

export const FazmAgentController = {
    runAutomation,
    getStatus,
};
