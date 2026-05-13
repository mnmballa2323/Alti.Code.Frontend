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
    listTools,
    connectServer,
    runTool
};
