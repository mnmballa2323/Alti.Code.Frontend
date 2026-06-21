/**
 * Copyright (c) 2024 Inso Code
 * 
 * MCP Controller
 * Manage Model Context Protocol (MCP) connections.
 */

import fs from 'fs';
import path from 'path';
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
    const { name, command, args, env } = req.body;
    await mcpClientService.connect(name, command, args, env);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Connected to MCP server [${name}].`,
    });
});

const disconnectServer = catchAsync(async (req, res) => {
    const { name } = req.body;
    await mcpClientService.disconnect(name);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Disconnected from MCP server [${name}].`,
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

const customServersFilePath = path.join(process.cwd(), '.alti/custom_mcp_servers.json');

const getCustomMcpServers = catchAsync(async (req, res) => {
    let servers = [];
    if (fs.existsSync(customServersFilePath)) {
        try {
            const fileData = fs.readFileSync(customServersFilePath, 'utf8');
            servers = JSON.parse(fileData);
        } catch (err) {
            console.error('Failed to parse custom MCP servers JSON:', err);
        }
    }
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Custom MCP servers retrieved successfully.',
        data: servers,
    });
});

const addCustomMcpServer = catchAsync(async (req, res) => {
    const { name, title, description, command, args, env } = req.body;
    if (!name || !command) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Server name and command are required.',
        });
    }

    let servers = [];
    if (fs.existsSync(customServersFilePath)) {
        try {
            const fileData = fs.readFileSync(customServersFilePath, 'utf8');
            servers = JSON.parse(fileData);
        } catch (err) {
            console.error('Failed to parse custom MCP servers JSON:', err);
        }
    }

    const dirPath = path.dirname(customServersFilePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const existingIndex = servers.findIndex(s => s.name === name);
    const newServer = {
        name,
        title: title || name,
        description: description || `Custom Model Context Protocol server running via ${command}`,
        command,
        args: args || [],
        env: env || {},
        updatedAt: new Date().toISOString(),
    };

    if (existingIndex > -1) {
        servers[existingIndex] = newServer;
    } else {
        servers.push(newServer);
    }

    fs.writeFileSync(customServersFilePath, JSON.stringify(servers, null, 2), 'utf8');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Custom MCP server [${name}] registered successfully.`,
        data: servers,
    });
});

const deleteCustomMcpServer = catchAsync(async (req, res) => {
    const { name } = req.params;
    if (!name) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Server name is required.',
        });
    }

    let servers = [];
    if (fs.existsSync(customServersFilePath)) {
        try {
            const fileData = fs.readFileSync(customServersFilePath, 'utf8');
            servers = JSON.parse(fileData);
        } catch (err) {
            console.error('Failed to parse custom MCP servers JSON:', err);
        }
    }

    const filteredServers = servers.filter(s => s.name !== name);
    fs.writeFileSync(customServersFilePath, JSON.stringify(filteredServers, null, 2), 'utf8');

    try {
        await mcpClientService.disconnect(name);
    } catch (err) {
        console.warn(`Could not disconnect running client [${name}]:`, err.message);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Custom MCP server [${name}] deleted successfully.`,
        data: filteredServers,
    });
});

export const McpController = {
    listTools,
    connectServer,
    disconnectServer,
    runTool,
    getCustomMcpServers,
    addCustomMcpServer,
    deleteCustomMcpServer
};
