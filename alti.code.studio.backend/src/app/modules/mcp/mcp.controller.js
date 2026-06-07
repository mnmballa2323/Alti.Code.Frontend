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
    const { name, command, args, env } = req.body;
    await mcpClientService.connect(name, command, args, env);
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
    getComposioApps,
    getConnections,
    connectComposioApp,
    disconnectComposioApp,
    getAppTriggers,
    getToolkitTools,
    listTools,
    connectServer,
    runTool,
    getCustomMcpServers,
    addCustomMcpServer,
    deleteCustomMcpServer
};
