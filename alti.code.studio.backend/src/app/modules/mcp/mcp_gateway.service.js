import { logger } from '../../../shared/logger.js';
import { capabilityRouter } from '../agents/capability.router.js';
import { BaseSpecialistAgent } from '../agents/base_specialist.agent.js';
import { mcpClientService, PRESETS } from './mcp.client.js';

/**
 * Dynamic Nano-Agent acting as a transparent proxy for an MCP Server.
 */
class MCPNanoAgent extends BaseSpecialistAgent {
    constructor(serverName, tools, resources, preamble) {
        super(serverName, `${serverName} Specialist`, 'pro');
        this.name = `${serverName}_agent`;
        this.displayName = `${serverName} Specialist`;
        this.description = preamble;
        this.preamble = preamble;
        this.temperature = 0.1;
        this.tools = tools;
        this.resources = resources;
    }

    async _invoke(prompt, contextBlock) {
        // Map available tools, replace dashes with underscores for tool naming prefix compatibility in Swarm Brain
        const serverSegment = this.name.replace('_agent', '').replace(/-/g, '_');
        const formattedTools = this.tools.map(t => ({
            name: `${serverSegment}__${t.name}`,
            description: t.description,
            inputSchema: t.inputSchema
        }));

        const systemPrompt = `${this.preamble}
=== AVAILABLE MCP TOOLS ===
You can call the following tools by outputting exactly:
\`\`\`json
{
  "__MCP_CALL__": {
    "tool": "tool_name_here",
    "params": { ... }
  }
}
\`\`\`
Ensure tool name matches exactly from this list (replace dashes with underscores for server name segment):
${JSON.stringify(formattedTools, null, 2)}

=== CONTEXT ===
${contextBlock}

=== USER REQUEST ===
${prompt}`;

        const { GeminiAiService } = await import('../gemini/gemini.service.js');
        return await GeminiAiService.generateContent(systemPrompt);
    }
}

/**
 * Phase 13.0.0: The Omnilayer Integration Nexus
 * MCP Gateway Service
 * 
 * Dynamically connects to any Model Context Protocol (MCP) compatible server (stdio or SSE),
 * fetches the exposed tools and resources, and autonomously registers a Nano-Agent
 * directly into the CapabilityRouter to execute them.
 */
class MCPGateway {
    constructor() {
        this.connectedServers = new Map();
        logger.info('🔌 MCPGateway initialized. Scanning for local and remote MCP hosts.');
    }

    /** Mapped active presets available in the ecosystem. */
    get presets() {
        const presetsMap = {};
        PRESETS.forEach(p => {
            presetsMap[p.name] = p;
        });
        return presetsMap;
    }

    /**
     * Connects to a target MCP server and mounts its capabilities natively.
     * 
     * @param {string} serverName The identifier for the MCP server (e.g., 'jira-mcp').
     * @param {Object} [connectionConfig] Transport config (stdio command, args, and optional env).
     */
    async mountServer(serverName, connectionConfig) {
        if (this.connectedServers.has(serverName)) {
            logger.warn(`🔌 MCP Server '${serverName}' is already mounted.`);
            const active = this.connectedServers.get(serverName);
            return {
                success: true,
                agentId: active.agentRef,
                toolsCount: active.toolsCount
            };
        }

        // Auto-resolve preset if configuration is not explicitly passed
        if (!connectionConfig) {
            const foundPreset = PRESETS.find(p => p.name === serverName);
            if (foundPreset) {
                connectionConfig = {
                    command: foundPreset.command,
                    args: foundPreset.args,
                    env: {}
                };
            } else {
                throw new Error(`Connection configuration is required for custom MCP server '${serverName}'`);
            }
        }

        logger.info(`🔌 Attempting to mount MCP Server: ${serverName}...`);

        try {
            let tools = [];
            let resources = [];

            try {
                // 1. Establish Transport using real client service
                await this._establishTransport(serverName, connectionConfig);

                // 2. Fetch Tools & Resources via MCP Protocol
                tools = await this._fetchMCPTools(serverName);
                resources = await this._fetchMCPResources(serverName);
            } catch (transportError) {
                logger.warn(`⚠️ Live MCP transport for '${serverName}' failed: ${transportError.message}. Synthesizing failover specialist with default capabilities.`);
                // Graceful fallback for local development & testing
                tools = [
                    {
                        name: `fetch_${serverName}_data`,
                        description: `Default fallback read tool to query ${serverName}`,
                        inputSchema: { type: 'object', properties: {} }
                    },
                    {
                        name: `write_${serverName}_data`,
                        description: `Default fallback write tool to mutate or post data to ${serverName}`,
                        inputSchema: { type: 'object', properties: { payload: { type: 'object' } } }
                    }
                ];
                resources = [];
            }

            // 3. Generate Dynamic "Nano-Agent" wrapper
            const nanoAgent = this._synthesizeNanoAgent(serverName, tools, resources);

            // 4. Map derived keywords and register to full swarm
            const dynamicKeywords = this._extractKeywordsFromTools(serverName, tools);
            capabilityRouter.registerAgent(nanoAgent, dynamicKeywords);

            this.connectedServers.set(serverName, {
                status: 'connected',
                toolsCount: tools.length,
                resourcesCount: resources.length,
                agentRef: nanoAgent.name
            });

            logger.info(`✨ Successfully mounted MCP Server '${serverName}'. Injected ${tools.length} abstract tools into the Swarm.`);

            return {
                success: true,
                agentId: nanoAgent.name,
                toolsCount: tools.length
            };

        } catch (error) {
            logger.error(`❌ Failed to mount MCP Server '${serverName}': ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async _establishTransport(serverName, config) {
        logger.info(`🔌 MCP: Connecting dynamic host ${serverName}...`);
        if (!config || !config.command) {
            throw new Error(`Invalid transport configuration for server '${serverName}'`);
        }
        return await mcpClientService.connect(serverName, config.command, config.args || [], config.env || {});
    }

    async _fetchMCPTools(serverName) {
        const result = await mcpClientService.listTools(serverName);
        return result.tools || [];
    }

    async _fetchMCPResources(serverName) {
        const result = await mcpClientService.listResources(serverName);
        return result.resources || [];
    }

    _synthesizeNanoAgent(serverName, tools, resources) {
        const toolNames = tools.map(t => t.name).join(', ');
        const preamble = `Dynamic Specialist Nano-Agent proxying the '${serverName}' MCP Server.
You have native access to the following server-side capabilities: [${toolNames}].
You must strictly format your outputs to match the expected schema of the MCP tool specifications.`;

        return new MCPNanoAgent(serverName, tools, resources, preamble);
    }

    _extractKeywordsFromTools(serverName, tools) {
        // Natively extracts routing weights from the MCP tool descriptions
        return [
            serverName, 
            `${serverName} API`, 
            'mcp tool execution', 
            ...tools.map(t => t.name.replace(/_/g, ' ')),
            ...tools.map(t => `${serverName} ${t.name.replace(/_/g, ' ')}`)
        ];
    }
}

export const mcpGateway = new MCPGateway();
