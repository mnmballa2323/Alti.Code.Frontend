/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/** Preset MCP server configurations loaded from env or defaults. */
export const PRESETS = [
  // --- CORE & SYSTEM ---
  {
    name: 'mcp-toolbox',
    command: 'npx',
    args: ['-y', '@toolbox-sdk/server'],
    envKey: 'MCP_ENABLE_MCP_TOOLBOX',
  },
  {
    name: 'pinecone',
    command: 'npx',
    args: ['-y', '@pinecone-database/mcp'],
    envKey: 'MCP_ENABLE_PINECONE',
  },
  {
    name: 'neo4j',
    command: 'npx',
    args: ['-y', '@nibronix/mcp-neo4j-server'],
    envKey: 'MCP_ENABLE_NEO4J',
  },
  {
    name: 'clickhouse',
    command: 'npx',
    args: ['-y', '@infoinlet/mcp-clickhouse'],
    envKey: 'MCP_ENABLE_CLICKHOUSE',
  },
  {
    name: 'snowflake',
    command: 'npx',
    args: ['-y', '@makotyo/mcp-snowflake'],
    envKey: 'MCP_ENABLE_SNOWFLAKE',
  },
  {
    name: 'databricks',
    command: 'npx',
    args: ['-y', '@squadbase/mcp-databricks'],
    envKey: 'MCP_ENABLE_DATABRICKS',
  },
  {
    name: 'qdrant',
    command: 'npx',
    args: ['-y', '@infoinlet/mcp-qdrant'],
    envKey: 'MCP_ENABLE_QDRANT',
  },
  {
    name: 'filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
    envKey: 'MCP_ENABLE_FILESYSTEM',
  },
  {
    name: 'sqlite',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '--file', 'database.sqlite'],
    envKey: 'MCP_ENABLE_SQLITE',
  },
  {
    name: 'postgres',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    envKey: 'MCP_ENABLE_POSTGRES',
  },
  {
    name: 'mysql',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-mysql'],
    envKey: 'MCP_ENABLE_MYSQL',
  },
  {
    name: 'redis',
    command: 'npx',
    args: ['-y', 'mcp-redis'],
    envKey: 'MCP_ENABLE_REDIS',
  },
  {
    name: 'mongodb',
    command: 'npx',
    args: ['-y', 'mongodb-mcp-server'],
    envKey: 'MCP_ENABLE_MONGODB',
  },
  {
    name: 'elasticsearch',
    command: 'npx',
    args: ['-y', '@infoinlet/mcp-elasticsearch'],
    envKey: 'MCP_ENABLE_ELASTICSEARCH',
  },
  {
    name: 'oracle',
    command: 'npx',
    args: ['-y', 'mcp-oracle-db'],
    envKey: 'MCP_ENABLE_ORACLE',
  },
  {
    name: 'cassandra',
    command: 'npx',
    args: ['-y', 'mcp-cassandra'],
    envKey: 'MCP_ENABLE_CASSANDRA',
  },
  {
    name: 'influxdb',
    command: 'npx',
    args: ['-y', 'influxdb-mcp-server'],
    envKey: 'MCP_ENABLE_INFLUXDB',
  },
  {
    name: 'singlestore',
    command: 'npx',
    args: ['-y', '@mcpflow.io/mcp-singlestore-mcp-server'],
    envKey: 'MCP_ENABLE_SINGLESTORE',
  },
  {
    name: 'neon',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-neon'],
    envKey: 'MCP_ENABLE_NEON',
  },
  {
    name: 'supabase',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-supabase'],
    envKey: 'MCP_ENABLE_SUPABASE',
  },

  // --- SOURCE CONTROL & PM ---
  {
    name: 'git',
    command: 'docker',
    args: ['run', '-i', '--rm', '-v', `${process.cwd()}:/projects`, 'mcp/git'],
    envKey: 'MCP_ENABLE_GIT',
  },
  {
    name: 'github',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    envKey: 'MCP_ENABLE_GITHUB',
  },
  {
    name: 'gitlab',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-gitlab'],
    envKey: 'MCP_ENABLE_GITLAB',
  },
  {
    name: 'jira',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-jira'],
    envKey: 'MCP_ENABLE_JIRA',
  },
  {
    name: 'linear',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-linear'],
    envKey: 'MCP_ENABLE_LINEAR',
  },
  {
    name: 'notion',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-notion'],
    envKey: 'MCP_ENABLE_NOTION',
  },
  {
    name: 'confluence',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-confluence'],
    envKey: 'MCP_ENABLE_CONFLUENCE',
  },

  // --- CLOUD & DEVOPS ---
  {
    name: 'aws',
    command: 'docker',
    args: ['run', '-i', '--rm', 'mcp/aws'],
    envKey: 'MCP_ENABLE_AWS',
  },
  {
    name: 'gcp',
    command: 'docker',
    args: ['run', '-i', '--rm', 'mcp/gcp'],
    envKey: 'MCP_ENABLE_GCP',
  },
  {
    name: 'azure',
    command: 'docker',
    args: ['run', '-i', '--rm', 'mcp/azure'],
    envKey: 'MCP_ENABLE_AZURE',
  },
  {
    name: 'kubernetes',
    command: 'docker',
    args: ['run', '-i', '--rm', 'mcp/kubernetes'],
    envKey: 'MCP_ENABLE_KUBERNETES',
  },
  {
    name: 'docker',
    command: 'docker',
    args: ['run', '-i', '--rm', '-v', '/var/run/docker.sock:/var/run/docker.sock', 'mcp/docker'],
    envKey: 'MCP_ENABLE_DOCKER',
  },
  {
    name: 'terraform',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-terraform'],
    envKey: 'MCP_ENABLE_TERRAFORM',
  },
  {
    name: 'cloudflare',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-cloudflare'],
    envKey: 'MCP_ENABLE_CLOUDFLARE',
  },

  // --- MONITORING & LOGGING ---
  {
    name: 'sentry',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sentry'],
    envKey: 'MCP_ENABLE_SENTRY',
  },
  {
    name: 'datadog',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-datadog'],
    envKey: 'MCP_ENABLE_DATADOG',
  },
  {
    name: 'prometheus',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-prometheus'],
    envKey: 'MCP_ENABLE_PROMETHEUS',
  },

  // --- INTELLIGENCE & UTILITY ---
  {
    name: 'sequential-thinking',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    envKey: 'MCP_ENABLE_SEQUENTIAL_THINKING',
  },
  {
    name: 'memory',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    envKey: 'MCP_ENABLE_MEMORY',
  },
  {
    name: 'fetch',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    envKey: 'MCP_ENABLE_FETCH',
  },
  {
    name: 'puppeteer',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    envKey: 'MCP_ENABLE_PUPPETEER',
  },
  {
    name: 'pdf',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-pdf'],
    envKey: 'MCP_ENABLE_PDF',
  },
  {
    name: 'npm',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-npm'],
    envKey: 'MCP_ENABLE_NPM',
  },
  {
    name: 'python',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-python'],
    envKey: 'MCP_ENABLE_PYTHON',
  },
  {
    name: 'brave-search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    envKey: 'MCP_ENABLE_BRAVE_SEARCH',
  },
  {
    name: 'google-maps',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-maps'],
    envKey: 'MCP_ENABLE_GOOGLE_MAPS',
  },

  // --- COMMUNICATION & APPS ---
  {
    name: 'slack',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    envKey: 'MCP_ENABLE_SLACK',
  },
  {
    name: 'discord',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-discord'],
    envKey: 'MCP_ENABLE_DISCORD',
  },
  {
    name: 'stripe',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-stripe'],
    envKey: 'MCP_ENABLE_STRIPE',
  },
  {
    name: 'figma',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-figma'],
    envKey: 'MCP_ENABLE_FIGMA',
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
      const transport = new StdioClientTransport({
        command,
        args,
        env: mergedEnv,
      });

      const client = new Client(
        { name: 'AltiClient', version: '1.0.0' },
        { capabilities: { prompts: {}, resources: {}, tools: {} } },
      );

      await client.connect(transport);
      this.clients.set(serverName, client);
      logger.info(`✅ MCP: Connected to ${serverName}`);
      return client;
    } catch (error) {
      logger.error(
        `❌ MCP Connection Failed [${serverName}]: ${error.message}`,
      );
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
        logger.warn(
          `⚠️ MCP: Cannot disconnect "${serverName}" — not connected.`,
        );
        return;
      }
      await client
        .close()
        .catch(e =>
          logger.warn(`MCP close error [${serverName}]: ${e.message}`),
        );
      this.clients.delete(serverName);
      logger.info(`🔌 MCP: Disconnected from ${serverName}`);
    } else {
      // Disconnect all
      for (const [name, client] of this.clients.entries()) {
        await client
          .close()
          .catch(e => logger.warn(`MCP close error [${name}]: ${e.message}`));
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
        tools.forEach(tool =>
          allTools.push({
            server: serverName,
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          }),
        );
      } catch (error) {
        logger.warn(
          `⚠️ Failed to list tools for ${serverName}: ${error.message}`,
        );
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
    logger.info(
      `🔌 MCP: Scanning [${PRESETS.length}] presets for env opt-ins...`,
    );

    // Run preset connections in parallel — was sequential, causing slow preset to block others
    const settled = await Promise.allSettled(
      PRESETS.map(async preset => {
        if (this.clients.has(preset.name)) {
          return { name: preset.name, status: 'ALREADY_CONNECTED' };
        }
        if (process.env[preset.envKey] !== 'true') {
          logger.info(
            `🔌 MCP: Preset [${preset.name}] skipped — set ${preset.envKey}=true to enable.`,
          );
          return {
            name: preset.name,
            status: 'DISABLED',
            hint: `Set ${preset.envKey}=true`,
          };
        }
        let env = {};
        if (preset.name === 'github') {
          const token =
            process.env.GITHUB_TOKEN ||
            process.env.GITHUB_PERSONAL_ACCESS_TOKEN ||
            config.github_token;
          if (token) {
            env = {
              GITHUB_PERSONAL_ACCESS_TOKEN: token,
              GITHUB_TOKEN: token,
            };
          }
        }
        await this.connect(preset.name, preset.command, preset.args, env);
        return { name: preset.name, status: 'CONNECTED' };
      }),
    );

    return settled.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      logger.warn(
        `⚠️ MCP: Preset [${PRESETS[i].name}] failed: ${r.reason?.message}`,
      );
      return {
        name: PRESETS[i].name,
        status: 'FAILED',
        error: r.reason?.message,
      };
    });
  }

  /** Connect to a dynamic server config object. */
  async connectDynamic(config) {
    if (!config?.name || !config?.command) {
      throw new Error(
        'McpClientService: connectDynamic requires config.name and config.command.',
      );
    }
    return this.connect(config.name, config.command, config.args ?? []);
  }

  /** @private */
  _getClient(serverName) {
    const client = this.clients.get(serverName);
    if (!client)
      throw new Error(
        `MCP Client "${serverName}" not connected. Call connect() first.`,
      );
    return client;
  }
}

export const mcpClientService = new McpClientService();
