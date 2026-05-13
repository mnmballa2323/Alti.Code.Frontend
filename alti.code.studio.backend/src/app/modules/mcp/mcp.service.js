/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { logger } from '../../../shared/logger.js';
import { EventSource } from 'eventsource';
import crypto from 'crypto';

// Make EventSource available globally for the SDK
global.EventSource = EventSource;

/** Active MCP connections keyed by UUID. */
const connections = new Map();

/**
 * Connect to an MCP server (real or mock).
 * @param {string} serverUrl
 * @param {string} [apiKey]
 * @returns {Promise<{ connectionId: string, status: string, tools: number }>}
 */
const connect = async (serverUrl, apiKey) => {
    if (!serverUrl || typeof serverUrl !== 'string') {
        throw new Error('McpService: serverUrl must be a non-empty string.');
    }

    logger.info(`🔌 MCP: Connecting to ${serverUrl}`);

    // UUID-based connectionId — Date.now() would collide under concurrent connections
    const connectionId = `conn-${crypto.randomUUID()}`;

    if (serverUrl.includes('mock') || serverUrl.includes('localhost')) {
        const mockTools = [
            { name: 'query_database', description: 'Execute SQL query', inputSchema: {} },
            { name: 'fetch_linear_issues', description: 'Get issues from Linear', inputSchema: {} },
        ];

        connections.set(connectionId, { url: serverUrl, status: 'connected', tools: mockTools, client: null });
        logger.info(`🔌 MCP: Mock connection established [${connectionId}]`);
        return { connectionId, status: 'connected', tools: mockTools.length };
    }

    try {
        const transport = new SSEClientTransport(new URL(serverUrl), {
            eventSourceInit: { headers: { Authorization: `Bearer ${apiKey}` } },
        });
        const client = new Client({ name: 'AltiCodeStudio', version: '1.0.0' }, { capabilities: {} });
        await client.connect(transport);

        const capabilities = await client.getServerCapabilities();
        const { tools } = await client.listTools();

        connections.set(connectionId, { url: serverUrl, status: 'connected', client, tools });
        logger.info(`🔌 MCP: Connected [${connectionId}] — ${tools.length} tools available.`);

        return { connectionId, status: 'connected', server: capabilities, tools: tools.length };

    } catch (error) {
        logger.error(`❌ MCP: Connection to ${serverUrl} failed — ${error.message}`);
        throw new Error(`Failed to connect to MCP server: ${error.message}`);
    }
};

/**
 * Disconnect from an active MCP connection.
 * @param {string} connectionId
 */
const disconnect = async (connectionId) => {
    const conn = connections.get(connectionId);
    if (!conn) {
        logger.warn(`🔌 MCP: disconnect() called on unknown connectionId "${connectionId}"`);
        return;
    }
    if (conn.client?.close) {
        await conn.client.close().catch(() => { }); // best-effort
    }
    connections.delete(connectionId);
    logger.info(`🔌 MCP: Disconnected [${connectionId}]`);
};

/**
 * List tools for an active connection. Does NOT mutate the cached connection.
 * @param {string} connectionId
 * @returns {Promise<object[]>}
 */
const listTools = async (connectionId) => {
    const conn = connections.get(connectionId);
    if (!conn) throw new Error(`McpService: Connection "${connectionId}" not found.`);

    if (conn.client) {
        const { tools } = await conn.client.listTools();
        // Refresh cache immutably — replace, don't mutate
        connections.set(connectionId, { ...conn, tools });
        return tools;
    }
    return conn.tools ?? [];
};

/**
 * Execute a tool on an active connection.
 * @param {string} connectionId
 * @param {string} toolName
 * @param {object} [args={}]
 */
const executeTool = async (connectionId, toolName, args = {}) => {
    if (!toolName || typeof toolName !== 'string') {
        throw new Error('McpService: toolName must be a non-empty string.');
    }
    if (typeof args !== 'object' || args === null) {
        throw new Error('McpService: args must be a non-null object.');
    }

    const conn = connections.get(connectionId);
    if (!conn) throw new Error(`McpService: Connection "${connectionId}" not found.`);

    logger.info(`🔧 MCP: Executing tool "${toolName}" on [${connectionId}]`, args);

    if (conn.client) {
        return await conn.client.callTool({ name: toolName, arguments: args });
    }

    // Mock execution
    return {
        content: [{ type: 'text', text: `Mock result for ${toolName}: Success` }],
    };
};

/**
 * Return a summary of all active connections.
 * @returns {{ total: number, connections: object[] }}
 */
const getStatus = () => {
    const all = [...connections.entries()].map(([id, c]) => ({
        connectionId: id,
        url: c.url,
        status: c.status,
        toolCount: c.tools?.length ?? 0,
    }));
    return { total: all.length, connections: all };
};

export const McpService = {
    connect,
    disconnect,
    listTools,
    executeTool,
    getStatus,
};
