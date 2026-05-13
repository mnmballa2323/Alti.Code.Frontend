/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * MCP Controller
 * Manage Model Context Protocol (MCP) connections.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { mcpClientService } from './mcp.client.js';
import { composioService } from './composio.service.js';

const getComposioApps = catchAsync(async (req, res) => {
    const apps = await composioService.getApps();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Composio Apps retrieved successfully.',
        data: apps,
    });
});

const connectComposioApp = catchAsync(async (req, res) => {
    const { appName } = req.body;
    
    if (!appName) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'App name is required.',
        });
    }

    const connectionData = await composioService.initiateConnection(appName, req.user.id);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Composio connection initiated.',
        data: connectionData,
    });
});

const getConnections = catchAsync(async (req, res) => {
    const connections = await composioService.getConnections(req.user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Composio connections retrieved successfully.',
        data: connections,
    });
});

const disconnectComposioApp = catchAsync(async (req, res) => {
    const { appName } = req.body;
    if (!appName) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'App name is required.',
        });
    }

    const success = await composioService.disconnectApp(appName, req.user.id);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Composio connection disconnected.',
        data: { success },
    });
});

const getAppTriggers = catchAsync(async (req, res) => {
    const { appName } = req.params;
    if (!appName) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'App name is required.',
        });
    }

    const triggers = await composioService.getAppTriggers(appName);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Composio triggers retrieved successfully.',
        data: triggers,
    });
});

const getToolkitTools = catchAsync(async (req, res) => {
    const { appName } = req.params;
    if (!appName) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'App name is required.',
        });
    }

    const tools = await composioService.getToolkitTools(appName);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Composio toolkit tools retrieved successfully.',
        data: tools,
    });
});

const listTools = catchAsync(async (req, res) => {
    const tools = await mcpClientService.getAllTools();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'MCP Tools retrieved successfully.',
        data: tools,
    });
});

const connectServer = catchAsync(async (req, res) => {
    const { name, command, args } = req.body;
    await mcpClientService.connect(name, command, args);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Connected to MCP server [${name}].`,
    });
});

const runTool = catchAsync(async (req, res) => {
    const { server, tool, args } = req.body;
    const result = await mcpClientService.callTool(server, tool, args);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tool executed successfully.',
        data: result,
    });
});

export const McpController = {
    getComposioApps,
    getConnections,
    connectComposioApp,
    disconnectComposioApp,
    getAppTriggers,
    getToolkitTools,
    listTools,
    connectServer,
    runTool
};
