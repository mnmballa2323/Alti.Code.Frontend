/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/** Preset MCP server configurations loaded from env or defaults. */
export const PRESETS = [
    {
        name: 'filesystem',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
        envKey: 'MCP_ENABLE_FILESYSTEM',
    },
    {
        name: 'git',
        command: 'docker',
        args: ['run', '-i', '--rm', '-v', `${process.cwd()}:/projects`, 'mcp/git'],
        envKey: 'MCP_ENABLE_GIT',
    },
    {
        name: 'sqlite',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sqlite', '--file', 'database.sqlite'],
        envKey: 'MCP_ENABLE_SQLITE',
    },
    {
        name: 'github',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        envKey: 'MCP_ENABLE_GITHUB',
    },
    {
        name: 'sentry',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sentry'],
        envKey: 'MCP_ENABLE_SENTRY',
    },
    {
        name: 'postgres',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        envKey: 'MCP_ENABLE_POSTGRES',
    },
    {
        name: 'puppeteer',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
        envKey: 'MCP_ENABLE_PUPPETEER',
    },
];

class McpClientService {
    constructor() {
        /** @type {Map<string, Client>} */
        this.clients = new Map();
    }

    /**
     * Connect to a local MCP server via stdio.
     * @param {string} serverName - Unique name for the connection
     * @param {string} command    - Command to run the server (e.g. "node")
     * @param {string[]} args     - Arguments for the command
     * @param {object} env        - Custom environment variables
     */
    async connect(serverName, command, args = [], env = {}) {
        if (this.clients.has(serverName)) {
            logger.info(`🔌 MCP: Already connected to ${serverName} — skipping.`);
            return this.clients.get(serverName);
        }

        logger.info(`🔌 MCP: Connecting to ${serverName}...`);

        try {
            const mergedEnv = { ...process.env, ...env };
            const transport = new StdioClientTransport({ command, args, env: mergedEnv });

            const client = new Client(
                { name: 'AltiClient', version: '1.0.0' },
                { capabilities: { prompts: {}, resources: {}, tools: {} } }
            );

            await client.connect(transport);
            this.clients.set(serverName, client);
            logger.info(`✅ MCP: Connected to ${serverName}`);
            return client;

        } catch (error) {
            logger.error(`❌ MCP Connection Failed [${serverName}]: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gracefully disconnect a named server, or all servers if no name given.
     * @param {string} [serverName]
     */
    async disconnect(serverName) {
        if (serverName) {
            const client = this.clients.get(serverName);
            if (!client) {
                logger.warn(`⚠️ MCP: Cannot disconnect "${serverName}" — not connected.`);
                return;
            }
            await client.close().catch(e => logger.warn(`MCP close error [${serverName}]: ${e.message}`));
            this.clients.delete(serverName);
            logger.info(`🔌 MCP: Disconnected from ${serverName}`);
        } else {
            // Disconnect all
            for (const [name, client] of this.clients.entries()) {
                await client.close().catch(e => logger.warn(`MCP close error [${name}]: ${e.message}`));
                logger.info(`🔌 MCP: Disconnected from ${name}`);
            }
            this.clients.clear();
        }
    }

    async listTools(serverName) {
        const client = this._getClient(serverName);
        return await client.listTools();
    }

    async listResources(serverName) {
        const client = this._getClient(serverName);
        return await client.listResources().catch(() => ({ resources: [] }));
    }

    async callTool(serverName, toolName, args) {
        if (!toolName || typeof toolName !== 'string') {
            throw new Error('McpClientService: toolName must be a non-empty string.');
        }
        if (args !== undefined && (typeof args !== 'object' || args === null)) {
            throw new Error('McpClientService: args must be a non-null object.');
        }
        const client = this._getClient(serverName);
        return await client.callTool({ name: toolName, arguments: args ?? {} });
    }

    /**
     * Get all available tools from all connected servers.
     * @returns {Promise<Array>}
     */
    async getAllTools() {
        const allTools = [];
        for (const [serverName, client] of this.clients.entries()) {
            try {
                const { tools = [] } = await client.listTools();
                tools.forEach(tool => allTools.push({
                    server: serverName,
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                }));
            } catch (error) {
                logger.warn(`⚠️ Failed to list tools for ${serverName}: ${error.message}`);
            }
        }
        return allTools;
    }

    /**
     * Connect to preset servers that are opt-in via environment variables.
     * Set MCP_ENABLE_FILESYSTEM=true, MCP_ENABLE_GIT=true, etc. to activate.
     * @returns {Promise<Array<{ name: string, status: string, error?: string }>>}
     */
    async connectPresets() {
        logger.info(`🔌 MCP: Scanning [${PRESETS.length}] presets for env opt-ins...`);

        // Run preset connections in parallel — was sequential, causing slow preset to block others
        const settled = await Promise.allSettled(
            PRESETS.map(async (preset) => {
                if (this.clients.has(preset.name)) {
                    return { name: preset.name, status: 'ALREADY_CONNECTED' };
                }
                if (process.env[preset.envKey] !== 'true') {
                    logger.info(`🔌 MCP: Preset [${preset.name}] skipped — set ${preset.envKey}=true to enable.`);
                    return { name: preset.name, status: 'DISABLED', hint: `Set ${preset.envKey}=true` };
                }
                let env = {};
                if (preset.name === 'github') {
                    const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || config.github_token;
                    if (token) {
                        env = {
                            GITHUB_PERSONAL_ACCESS_TOKEN: token,
                            GITHUB_TOKEN: token
                        };
                    }
                }
                await this.connect(preset.name, preset.command, preset.args, env);
                return { name: preset.name, status: 'CONNECTED' };
            })
        );

        return settled.map((r, i) => {
            if (r.status === 'fulfilled') return r.value;
            logger.warn(`⚠️ MCP: Preset [${PRESETS[i].name}] failed: ${r.reason?.message}`);
            return { name: PRESETS[i].name, status: 'FAILED', error: r.reason?.message };
        });
    }

    /** Connect to a dynamic server config object. */
    async connectDynamic(config) {
        if (!config?.name || !config?.command) {
            throw new Error('McpClientService: connectDynamic requires config.name and config.command.');
        }
        return this.connect(config.name, config.command, config.args ?? []);
    }

    /** @private */
    _getClient(serverName) {
        const client = this.clients.get(serverName);
        if (!client) throw new Error(`MCP Client "${serverName}" not connected. Call connect() first.`);
        return client;
    }
}

export const mcpClientService = new McpClientService();
