/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { RefactorAgentService } from './refactorAgent.service.js';
import { queueService } from '../queue/queue.service.js';

const startRefactor = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.body.sessionId || `refactor-${Date.now()}`;

    const { code, instruction } = req.body;

    // Guard against missing required fields before reaching the service layer
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Missing required field: code (non-empty string)',
            data: null,
        });
    }
    if (!instruction || typeof instruction !== 'string' || instruction.trim().length === 0) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Missing required field: instruction (non-empty string)',
            data: null,
        });
    }

    const result = await RefactorAgentService.refactorCode(code, instruction, userId, sessionId);
    sendResponse(res, {
        statusCode: httpStatus.ACCEPTED,   // 202 — job is queued, not yet complete
        success: true,
        message: 'Refactor job queued successfully',
        data: result,
    });
});

export const RefactorAgentController = {
    startRefactor,
    getJobStatus: catchAsync(async (req, res) => {
        const { jobId } = req.params;
        const job = await queueService.getJob('refactor-queue', jobId);

        if (!job) {
            return sendResponse(res, {
                statusCode: httpStatus.NOT_FOUND,
                success: false,
                message: `Job "${jobId}" not found. It may have already completed and been cleaned up.`,
                data: null,
            });
        }

        const state = await job.getState();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Job status retrieved',
            data: {
                jobId: job.id,
                state,
                progress: job.progress,
                returnValue: job.returnvalue,
                failedReason: job.failedReason,
            },
        });
    }),
};

