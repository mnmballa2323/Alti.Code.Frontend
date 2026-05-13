import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GitAgentService } from './gitAgent.service.js';

const start = catchAsync(async (req, res) => {
    const result = await GitAgentService.startWatcher(req.body.dir);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Auto-Git Sync started',
        data: result,
    });
});

const stop = catchAsync(async (req, res) => {
    const result = await GitAgentService.stopWatcher();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Auto-Git Sync stopped',
        data: result,
    });
});

const status = catchAsync(async (req, res) => {
    const result = await GitAgentService.getStatus();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Auto-Git Sync status retrieved',
        data: result,
    });
});

const forceSync = catchAsync(async (req, res) => {
    // Trigger sync manually (bypassing debounce)
    GitAgentService.syncChanges(); // Async, don't await to return response immediately or await if client wants confirmation?
    // Let's just return accepted
    sendResponse(res, {
        statusCode: httpStatus.ACCEPTED,
        success: true,
        message: 'Sync triggered',
    });
});

export const GitAgentController = {
    start,
    stop,
    status,
    forceSync
};
