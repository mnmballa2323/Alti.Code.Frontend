/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { logger } from '../../../shared/logger.js';

class McpClientService {
    constructor() {
        this.clients = new Map();
    }

    /**
     * Connect to a local MCP server
     * @param {string} serverName - Unique name for the connection
     * @param {string} command - Command to run the server (e.g. "node")
     * @param {string[]} args - Arguments for the command
     */
    async connect(serverName, command, args = []) {
        logger.info(`🔌 MCP: Connecting to ${serverName}...`);

        try {
            const transport = new StdioClientTransport({
                command,
                args,
            });

            const client = new Client({
                name: "AltiClient",
                version: "1.0.0",
            }, {
                capabilities: {
                    prompts: {},
                    resources: {},
                    tools: {},
                },
            });

            await client.connect(transport);
            this.clients.set(serverName, client);

            logger.info(`✅ MCP: Connected to ${serverName}`);
            return client;

        } catch (error) {
            logger.error(`❌ MCP Connection Failed: ${error.message}`);
            throw error;
        }
    }

    async listTools(serverName) {
        const client = this.clients.get(serverName);
        if (!client) throw new Error(`MCP Client ${serverName} not found.`);
        return await client.listTools();
    }

    async callTool(serverName, toolName, args) {
        const client = this.clients.get(serverName);
        if (!client) throw new Error(`MCP Client ${serverName} not found.`);
        return await client.callTool({
            name: toolName,
            arguments: args
        });
    }
}

export const mcpClientService = new McpClientService();
