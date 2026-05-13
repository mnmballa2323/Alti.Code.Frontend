import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { McpService } from './mcp.service.js';

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
    const result = await McpService.listTools(req.params.connectionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Retrieved MCP tools',
        data: result,
    });
});

const executeTool = catchAsync(async (req, res) => {
    const result = await McpService.executeTool(req.params.connectionId, req.body.toolName, req.body.args);
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
