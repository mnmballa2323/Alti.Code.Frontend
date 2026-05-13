import { logger } from '../../utils/logger.js';
import { capabilityRouter } from './capability.router.js';
import { BaseSpecialistAgent } from './base_specialist.agent.js';

/**
 * Phase 13.0.0: The Omnilayer Integration Nexus
 * MCP Gateway Service
 * 
 * Instead of relying on hardcoded REST API wrappers, this gateway dynamically
 * connects to any Model Context Protocol (MCP) compatible server (stdio or SSE).
 * It ingests the server's exposed tools and prompts, and autonomously generates 
 * a "Nano-Agent" directly into the CapabilityRouter to execute them.
 */
class MCPGateway {
    constructor() {
        this.connectedServers = new Map();
        logger.info('🔌 MCPGateway initialized. Scanning for local and remote MCP hosts.');
    }

    /**
     * Connects to a target MCP server and mounts its capabilities natively.
     * 
     * @param {string} serverName The identifier for the MCP server (e.g., 'jira-mcp').
     * @param {Object} connectionConfig Transport config (stdio command or SSE URL).
     */
    async mountServer(serverName, connectionConfig) {
        if (this.connectedServers.has(serverName)) {
            logger.warn(`🔌 MCP Server '${serverName}' is already mounted.`);
            return;
        }

        logger.info(`🔌 Attempting to mount MCP Server: ${serverName}...`);

        try {
            // 1. Establish Transport (Simulation for architecture)
            const mcpClient = await this._establishTransport(connectionConfig);

            // 2. Fetch Tools & Prompts via MCP Protocol
            const tools = await this._fetchMCPTools(mcpClient);
            const resources = await this._fetchMCPResources(mcpClient);

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

        } catch (error) {
            logger.error(`❌ Failed to mount MCP Server '${serverName}': ${error.message}`);
        }
    }

    async _establishTransport(config) {
        // Simulates stdio/SSE connection handshake
        return new Promise(resolve => setTimeout(() => resolve({ id: config.id || 'sim_client' }), 300));
    }

    async _fetchMCPTools(client) {
        // Simulates `mcp.listTools()`
        return [{ name: 'execute_remote_action', description: 'Dynamic execution bridge.' }];
    }

    async _fetchMCPResources(client) {
        // Simulates `mcp.listResources()`
        return [{ uri: 'mcp://simulated/resource', name: 'Simulated Resource' }];
    }

    _synthesizeNanoAgent(serverName, tools, resources) {
        const toolNames = tools.map(t => t.name).join(', ');
        const preamble = `You are a dynamic Nano-Agent acting as a transparent proxy for the '${serverName}' MCP Server.
You have native execution access to the following server-side tools: [${toolNames}].
You must strictly format your outputs to match the expected schema of the MCP tool specifications.
Do not hallucinate parameters. If a resource URI is required, query the gateway natively.`;

        return new BaseSpecialistAgent({
            name: `MCPNanoAgent_${serverName}`,
            preamble: preamble,
            temperature: 0.1
        });
    }

    _extractKeywordsFromTools(serverName, tools) {
        // Natively extracts routing weights from the MCP tool descriptions
        return [serverName, `${serverName} API`, 'mcp tool execution', ...tools.map(t => t.name.replace(/_/g, ' '))];
    }
}

export const mcpGateway = new MCPGateway();
