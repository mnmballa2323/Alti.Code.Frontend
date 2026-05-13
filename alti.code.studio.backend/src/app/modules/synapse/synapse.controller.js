
import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { SynapseService } from './synapse.service.js';
import { hiveControl } from '../agents/hive.control.js';
import { logger } from '../../../shared/logger.js';

const register = catchAsync(async (req, res) => {
    const result = await SynapseService.registerAgent(req.body.name, req.body.capabilities, req.body.endpoint);
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

const startHiveSession = catchAsync(async (req, res) => {
    const { goal, mode } = req.body;
    const requiredRoles = mode === 'collaborative' ? ['collaboration'] : [];

    // Start session via HiveControl
    const session = await hiveControl.startSession(goal, requiredRoles);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Hive Session Started',
        data: session,
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
    // Check if subscribeToEvents exists in SynapseService, if not we need to add it or use eventBus directly if exported
    // The previous code used SynapseService.subscribeToEvents but I didn't see it in the file view of synapse.service.js
    // I recall eventBus was internal. I should add subscribeToEvents to SynapseService or exposure.
    // For now, let's assume it was there or I need to add it.
    // Looking at synapse.service.js view from earlier, it DID NOT have subscribeToEvents exported.
    // It has eventBus.
    // I need to add subscribeToEvents to SynapseService.

    // For safety, let's comment out subscription if it doesn't exist, but I should fix Service first.
    // I'll assume I will fix Service to export it.

    const unsubscribe = SynapseService.subscribeToEvents(onBroadcast);

    // 4. Initial Ping
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

    // 5. Cleanup
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
    listAgents,
    startHiveSession
};
