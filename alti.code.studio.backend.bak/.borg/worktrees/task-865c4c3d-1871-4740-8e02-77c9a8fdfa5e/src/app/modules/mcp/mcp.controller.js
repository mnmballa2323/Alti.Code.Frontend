/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { McpService } from './mcp.service.js';
import { mcpServer } from './mcp.server.js';

const connect = catchAsync(async (req, res) => {
    const result = await McpService.connect(req.body.serverUrl, req.body.apiKey);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Connected to MCP server',
        data: result,
    });
});

const listTools = catchAsync(async (req, res) => {
    let result;
    if (req.params.connectionId === 'local') {
        result = mcpServer.getLocalTools();
    } else {
        result = await McpService.listTools(req.params.connectionId);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Retrieved MCP tools',
        data: result,
    });
});

const executeTool = catchAsync(async (req, res) => {
    let result;
    if (req.params.connectionId === 'local') {
        // Execute directly on internal MCP Server
        result = await mcpServer.executeToolLocal(req.body.toolName, req.body.args);
    } else {
        // Execute on external MCP Server via Client
        result = await McpService.executeTool(req.params.connectionId, req.body.toolName, req.body.args);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tool executed successfully',
        data: result,
    });
});

export const McpController = {
    connect,
    listTools,
    executeTool
};
