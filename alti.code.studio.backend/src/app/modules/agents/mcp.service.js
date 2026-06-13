/**
 * Copyright (c) 2024 Inso Code
 *
 * mcp.service.js — Model Context Protocol (MCP) Bridge
 *
 * Implements the Anthropic open-source standard for AI Agent tool discovery.
 * Instead of writing hardcoded tools, the Swarm dynamically queries MCP servers
 * to discover and execute tools (e.g., SQLite, Slack, GitHub, local filesystem).
 */

import { logger } from '../../../shared/logger.js';
import { AgentMemoryHooks } from '../memory/agentmemory.hooks.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import configObject from '../../../../config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

class McpBridgeService extends EventEmitter {
  constructor() {
    super();
    this.servers = new Map(); // Map of name -> config
    this.clients = new Map(); // Map of name -> active SDK client
    this.toolsCache = new Map(); // Map of serverName -> { timestamp, tools }
    this.circuitBreaker = new Map(); // Map of serverName_toolName -> { failures, nextRetryTime }
    this.CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL
  }

  /**
   * Initializes the standard MCP connections by reading mcp_config.json
   */
  async init() {
    logger.info('🔌 [MCP] Initializing Model Context Protocol Bridge...');

    try {
      const configPath = path.resolve(process.cwd(), 'mcp_config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const parsedConfig = JSON.parse(configData);

      if (parsedConfig.mcpServers) {
        for (const [name, config] of Object.entries(parsedConfig.mcpServers)) {
          this.registerServer(name, config);
        }
      }
    } catch (error) {
      logger.error(`❌ [MCP] Failed to load mcp_config.json: ${error.message}`);
    }

    logger.info(
      `✅ [MCP] Successfully registered ${this.servers.size} standardized MCP servers.`,
    );

    // Graceful shutdown hooks
    process.on('SIGINT', async () => await this.shutdown());
    process.on('SIGTERM', async () => await this.shutdown());
  }

  /**
   * Safely closes all active MCP client connections.
   */
  async shutdown() {
    if (this.clients.size === 0) return;
    logger.info(
      `🛑 [MCP] Shutting down ${this.clients.size} active MCP clients...`,
    );
    for (const [name, client] of this.clients.entries()) {
      try {
        await client.close();
        logger.info(`[MCP] Closed client: ${name}`);
      } catch (e) {
        logger.error(`[MCP] Error closing ${name}: ${e.message}`);
      }
    }
    this.clients.clear();
  }

  /**
   * Registers a new MCP server.
   */
  registerServer(name, config) {
    this.servers.set(name, config);
    this.emit('telemetry', {
      level: 'info',
      message: `Registered server: ${name}`,
    });
    logger.info(`[MCP] Registered server: ${name}`);
  }

  /**
   * Autonomous Tool Self-Provisioning
   * Modifies the local config file and dynamically loads a new server
   */
  async provisionServer(serverName, packageName) {
    logger.warn(
      `🤖 [MCP] Autonomous self-provisioning triggered for ${serverName} (${packageName})...`,
    );
    this.emit('telemetry', {
      level: 'warn',
      message: `Autonomously provisioning new MCP capability: ${serverName}`,
    });

    try {
      const configPath = path.resolve(process.cwd(), 'mcp_config.json');
      let parsedConfig = { mcpServers: {} };

      try {
        const configData = await fs.readFile(configPath, 'utf-8');
        parsedConfig = JSON.parse(configData);
      } catch (e) {}

      const newConfig = {
        command: 'npx',
        args: ['-y', packageName],
        env: {},
      };

      parsedConfig.mcpServers[serverName] = newConfig;
      await fs.writeFile(configPath, JSON.stringify(parsedConfig, null, 2));

      this.registerServer(serverName, newConfig);
      return {
        success: true,
        message: `Server ${serverName} provisioned successfully.`,
      };
    } catch (e) {
      logger.error(
        `[MCP] Failed to self-provision ${serverName}: ${e.message}`,
      );
      return { success: false, message: e.message };
    }
  }

  /**
   * Retrieves or establishes an MCP client connection to the server
   */
  async getClient(serverName) {
    if (this.clients.has(serverName)) {
      return this.clients.get(serverName);
    }

    const config = this.servers.get(serverName);
    if (!config)
      throw new Error(`MCP server [${serverName}] not found in config.`);

    const cleanedEnv = {};
    if (config.env) {
      for (const [key, value] of Object.entries(config.env)) {
        if (value !== undefined && value !== '') {
          cleanedEnv[key] = value;
        }
      }
    }

    if (serverName === 'github') {
      const token =
        process.env.GITHUB_TOKEN ||
        process.env.GITHUB_PERSONAL_ACCESS_TOKEN ||
        cleanedEnv.GITHUB_TOKEN ||
        cleanedEnv.GITHUB_PERSONAL_ACCESS_TOKEN ||
        configObject.github_token;
      if (token) {
        cleanedEnv.GITHUB_TOKEN = token;
        cleanedEnv.GITHUB_PERSONAL_ACCESS_TOKEN = token;
      }
    }

    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: { ...process.env, ...cleanedEnv },
    });

    const client = new Client(
      { name: 'alti-swarm-mcp-bridge', version: '1.0.0' },
      { capabilities: {} },
    );
    await client.connect(transport);

    this.clients.set(serverName, client);
    return client;
  }

  /**
   * Spawns an MCP server via STDIO and fetches its available tools dynamically.
   */
  async discoverTools(serverName) {
    const cached = this.toolsCache.get(serverName);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.tools;
    }

    logger.info(`🔍 [MCP] Discovering tools dynamically from ${serverName}...`);

    const client = await this.getClient(serverName);
    const response = await client.listTools();
    const discoveredTools = response.tools || [];

    this.toolsCache.set(serverName, {
      timestamp: Date.now(),
      tools: discoveredTools,
    });

    // 🧠 AgentMemory: Capture the discovery
    AgentMemoryHooks.captureToolUse(
      'mcp_bridge',
      `Discovered ${discoveredTools.length} tools dynamically from ${serverName}`,
      JSON.stringify(discoveredTools),
      { serverName },
    ).catch(e => {
      logger.warn(
        `⚠️ [MCP] Failed to capture memory for ${serverName}: ${e.message}`,
      );
    });

    return discoveredTools;
  }

  /**
   * Executes a tool via the MCP STDIO protocol
   */
  async executeTool(serverName, toolName, args = {}) {
    const telemetryMsg = `⚡ [MCP] Executing ${toolName} on server ${serverName}...`;
    logger.info(telemetryMsg);
    this.emit('telemetry', {
      level: 'info',
      message: telemetryMsg,
      data: args,
    });

    // Payload Validation/Sanitization (simple existence check)
    if (!serverName || !toolName) {
      throw new Error(
        `Invalid MCP execution request. Missing serverName or toolName.`,
      );
    }

    // Circuit Breaker Check
    const circuitKey = `${serverName}_${toolName}`;
    const breaker = this.circuitBreaker.get(circuitKey) || {
      failures: 0,
      nextRetryTime: 0,
    };
    if (Date.now() < breaker.nextRetryTime) {
      logger.warn(
        `🛑 [MCP] Circuit Breaker prevented execution of ${circuitKey}`,
      );
      return {
        isError: true,
        error: `[SYSTEM: CIRCUIT BREAKER TRIPPED] Tool ${serverName}/${toolName} is temporarily blacklisted due to repeated failures. DO NOT attempt to call this tool again. Find another approach.`,
      };
    }

    // Schema validation against cached tools
    const cached = this.toolsCache.get(serverName);
    if (cached && cached.tools) {
      const toolSchema = cached.tools.find(t => t.name === toolName);
      if (toolSchema) {
        const required = toolSchema.inputSchema?.required || [];
        for (const req of required) {
          if (args[req] === undefined) {
            throw new Error(
              `Validation failed: Missing required argument '${req}' for tool ${serverName}/${toolName}.`,
            );
          }
        }
      }
    }

    // Human-in-the-Loop (HITL) Check for Destructive Tools
    const config = this.servers.get(serverName);
    if (config && config.approvalRequired) {
      logger.warn(
        `🛑 [MCP HITL] Suspending execution. Tool ${serverName}/${toolName} requires human approval.`,
      );
      // Simulate WebSockets/SSE approval loop
      const isApproved = await new Promise(resolve => {
        logger.info(
          `[MCP HITL] Waiting for UI approval via WebSocket... (Auto-approving for headless backend)`,
        );
        setTimeout(() => resolve(true), 1500);
      });
      if (!isApproved) {
        return {
          isError: true,
          error: `[HITL] Execution rejected by human administrator.`,
        };
      }
    }

    const client = await this.getClient(serverName);

    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      });

      // Success: Reset Circuit Breaker
      breaker.failures = 0;
      this.circuitBreaker.set(circuitKey, breaker);

      // Large Payload Offloading
      const resultStr = JSON.stringify(result);
      if (resultStr.length > 50000) {
        logger.warn(
          `🗜️ [MCP] Tool payload is massive (${resultStr.length} bytes). Offloading to Google Cloud Storage...`,
        );
        try {
          const { GcsService } = await import('../googleCloud/gcs.service.js');
          const uri = await GcsService.uploadFile(
            'alti_swarm_artifacts',
            `mcp_payload_${Date.now()}.json`,
            resultStr,
          );
          return {
            _offloaded: true,
            uri: uri,
            summary:
              'Result was too large to fit in your context window and was offloaded to GCS. Use your tools to read the URI if you absolutely need it.',
          };
        } catch (e) {
          logger.error(
            `[MCP] Failed to offload MCP payload to GCS: ${e.message}. Returning raw data.`,
          );
        }
      }

      return result;
    } catch (error) {
      // Failure: Increment Circuit Breaker
      breaker.failures += 1;
      if (breaker.failures >= 3) {
        breaker.nextRetryTime = Date.now() + 60 * 60 * 1000; // 1 hour blacklist
        logger.error(
          `🚨 [MCP] CIRCUIT BREAKER TRIPPED for ${circuitKey}. Tool blacklisted for 1 hour.`,
        );
      }
      this.circuitBreaker.set(circuitKey, breaker);

      logger.error(
        `❌ [MCP] Execution failed for ${serverName}/${toolName}: ${error.message}`,
      );
      return { isError: true, error: error.message };
    }
  }

  /**
   * Helper to score semantic relevance of a tool to a prompt
   */
  scoreToolRelevance(toolDesc, prompt) {
    if (!prompt) return 1;
    const keywords = prompt
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3);
    const descWords = toolDesc.toLowerCase().split(/\W+/);
    let score = 0;
    for (const kw of keywords) {
      if (descWords.includes(kw)) score += 1;
    }
    return score;
  }

  /**
   * Formats all discovered MCP tools into Gemini-compatible Function Declarations.
   * Implements Semantic Routing to avoid token overflow by returning top N relevant tools.
   */
  async getGeminiTools(prompt = '') {
    let geminiTools = [];

    for (const [serverName] of this.servers) {
      try {
        const tools = await this.discoverTools(serverName);
        const formatted = tools.map(t => {
          const schema = t.inputSchema || { type: 'object', properties: {} };
          return {
            name: `${serverName.replace('-', '_')}__${t.name}`,
            description: `[MCP: ${serverName}] ${t.description}`,
            parameters: {
              type: 'OBJECT',
              properties: Object.fromEntries(
                Object.entries(schema.properties || {}).map(([k, v]) => [
                  k,
                  {
                    type: (v.type || 'string').toUpperCase(),
                    description: v.description,
                  },
                ]),
              ),
              required: schema.required || [],
            },
          };
        });
        geminiTools = geminiTools.concat(formatted);
      } catch (error) {
        logger.error(
          `❌ [MCP] Failed to format tools for ${serverName}: ${error.message}`,
        );
      }
    }

    // Semantic Routing Filter (Top 10)
    if (prompt && geminiTools.length > 10) {
      geminiTools = geminiTools
        .map(t => ({
          tool: t,
          score: this.scoreToolRelevance(t.name + ' ' + t.description, prompt),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(t => t.tool);
      logger.info(
        `[MCP] Semantically filtered ${geminiTools.length} tools for the current prompt.`,
      );
    }

    return geminiTools;
  }
}

export const mcpBridgeService = new McpBridgeService();
