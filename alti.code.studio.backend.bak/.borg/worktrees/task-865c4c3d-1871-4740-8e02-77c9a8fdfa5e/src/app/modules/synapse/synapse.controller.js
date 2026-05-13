/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

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

const listAgents = catchAsync(async (req, res) => {
    const result = await SynapseService.getAllAgents();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Agents retrieved successfully',
        data: result,
    });
});

const streamEvents = (req, res) => {
    // 1. Set SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    logger.info('📡 New SSE Client Connected');

    // 2. Define listener
    const onBroadcast = (event) => {
        // SSE format: "data: <json>\n\n"
        res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    // 3. Subscribe
    const unsubscribe = SynapseService.subscribeToEvents(onBroadcast);

    // 4. Initial Ping to keep connection alive immediately
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

    // 5. Cleanup on close
    req.on('close', () => {
        logger.info('🚫 SSE Client Disconnected');
        unsubscribe();
    });
};

export const SynapseController = {
    register,
    broadcast,
    sendDirect,
    streamEvents,
    listAgents
};
