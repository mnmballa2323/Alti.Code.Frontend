import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { logger } from '../../../shared/logger.js';
import { EventSource } from 'eventsource';

// Make EventSource available globally for the SDK if needed, or pass it
global.EventSource = EventSource;

// Storage for active connections
const connections = new Map();

const connect = async (serverUrl, apiKey) => {
    logger.info(`Connecting to MCP server: ${serverUrl}`);

    if (serverUrl.includes('mock') || serverUrl.includes('localhost')) {
        const connectionId = 'conn-' + Date.now();

        const mockTools = [
            { name: 'query_database', description: 'Execute SQL query', inputSchema: {} },
            { name: 'fetch_linear_issues', description: 'Get issues from Linear', inputSchema: {} }
        ];

        connections.set(connectionId, {
            url: serverUrl,
            status: 'connected',
            tools: mockTools,
            client: null
        });

        return {
            connectionId,
            status: 'connected',
            tools: mockTools.length
        };
    }

    try {
        const transport = new SSEClientTransport(new URL(serverUrl), {
            eventSourceInit: { headers: { 'Authorization': `Bearer ${apiKey}` } }
        });
        const client = new Client({ name: "AltiCodeStudio", version: "1.0.0" }, { capabilities: {} });
        await client.connect(transport);

        const capabilities = await client.getServerCapabilities();
        const tools = await client.listTools();

        const connectionId = 'conn-' + Date.now();
        connections.set(connectionId, {
            url: serverUrl,
            status: 'connected',
            client,
            tools: tools.tools
        });

        return {
            connectionId,
            status: 'connected',
            server: capabilities,
            tools: tools.tools.length
        };

    } catch (error) {
        logger.error('MCP Connection failed', error);
        throw new Error(`Failed to connect to MCP server: ${error.message}`);
    }
};

const listTools = async (connectionId) => {
    const conn = connections.get(connectionId);
    if (!conn) throw new Error('Connection not found');

    if (conn.client) {
        const tools = await conn.client.listTools();
        conn.tools = tools.tools;
    }

    return conn.tools;
};

const executeTool = async (connectionId, toolName, args) => {
    const conn = connections.get(connectionId);
    if (!conn) throw new Error('Connection not found');

    logger.info(`Executing tool ${toolName} on ${connectionId}`, args);

    if (conn.client) {
        const result = await conn.client.callTool({ name: toolName, arguments: args });
        return result;
    } else {
        return {
            content: [{ type: 'text', text: `Mock result for ${toolName}: Success` }]
        };
    }
};

export const McpService = {
    connect,
    listTools,
    executeTool
};
