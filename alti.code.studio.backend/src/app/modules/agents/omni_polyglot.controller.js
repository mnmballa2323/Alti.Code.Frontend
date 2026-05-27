/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Dynamic Polyglot Controller
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { omniPolyglotService } from './omni_polyglot.service.js';

const getCatalog = catchAsync(async (req, res) => {
    const catalog = omniPolyglotService.getCatalog();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Omni-Polyglot Swarm Catalog retrieved successfully',
        data: catalog
    });
});

const summonAgent = catchAsync(async (req, res) => {
    const { langId, funcId } = req.body;
    if (!langId || !funcId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Both langId and funcId are required to summon an agent.'
        });
    }

    const agent = omniPolyglotService.summon(langId, funcId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Dynamic agent [${agent.id}] successfully summoned to the Swarm!`,
        data: {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            capabilities: agent.capabilities,
            status: agent.status
        }
    });
});

const executeAgent = catchAsync(async (req, res) => {
    const { langId, funcId, task, code, context } = req.body;
    if (!langId || !funcId || !task) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'langId, funcId, and task are required to execute a dynamic agent.'
        });
    }

    const result = await omniPolyglotService.execute(langId, funcId, task, code, context);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Specialist dynamic agent execution completed.`,
        data: result
    });
});

export const OmniPolyglotController = {
    getCatalog,
    summonAgent,
    executeAgent
};
