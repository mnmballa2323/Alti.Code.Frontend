import { Composio } from '@composio/core';
import { logger } from '../../../shared/logger.js';
import { mcpClientService } from './mcp.client.js';

class ComposioService {
    constructor() {
        // Initialize Composio SDK.
        // Falls back to a dummy key to prevent crashes if not set in .env.
        // It's highly recommended to set COMPOSIO_API_KEY in the environment.
        this.apiKey = process.env.COMPOSIO_API_KEY || '';
        
        try {
            if (this.apiKey) {
                this.composio = new Composio({ apiKey: this.apiKey });
                logger.info('🔌 Composio MCP SDK initialized successfully.');
            } else {
                logger.warn('⚠️ COMPOSIO_API_KEY is not set. The ComposioService will operate in mocked fallback mode.');
                this.composio = null;
            }
        } catch (err) {
            logger.error(`❌ Failed to initialize Composio SDK: ${err.message}`);
            this.composio = null;
        }
    }

    /**
     * Fetch all available apps from the Composio ecosystem.
     * Returns a rich list of applications with descriptions and icons.
     */
    async getApps() {
        if (!this.composio) {
            return this._getMockCuratedApps();
        }

        try {
            // Retrieve the active catalog using the correct SDK toolkits API
            const response = await this.composio.toolkits.get({});
            return response.items || response;
        } catch (err) {
            logger.error(`❌ Composio getApps failed: ${err.message}`);
            return this._getMockCuratedApps();
        }
    }

    /**
     * Initiates an OAuth connection for a specific app integration.
     * Generates a redirectUrl for the user to securely authenticate.
     */
    async initiateConnection(appName, userId = 'default_user') {
        if (!this.composio) {
            // If there's no API key, we mock a redirect URL to keep the UI from breaking
            return {
                redirectUrl: `https://mock-oauth.composio.dev/auth/${appName}`,
                connectionId: `mock-conn-${Date.now()}`
            };
        }

        try {
            const connection = await this.composio.connectedAccounts.initiate({
                appName: appName,
                entityId: userId,
            });
            return {
                redirectUrl: connection.redirectUrl,
                connectionId: connection.connectionId
            };
        } catch (err) {
            logger.error(`❌ Composio initiateConnection failed: ${err.message}`);
            throw err;
        }
    }
    
    /**
     * Retrieve all active connected accounts for a specific user.
     */
    async getConnections(userId = 'default_user') {
        if (!this.composio) {
            return [];
        }
        
        try {
            const connections = await this.composio.connectedAccounts.list({});
            // The Composio list() returns all connections across the workspace by default,
            // or we might be able to filter by entityId if we had it.
            // For now, return what we found. We map them so the frontend knows what is connected.
            return connections.items || connections;
        } catch (err) {
            logger.error(`❌ Composio getConnections failed: ${err.message}`);
            return [];
        }
    }
    
    /**
     * Delete an active connection for an app.
     */
    async disconnectApp(appName, userId = 'default_user') {
        if (!this.composio) return true;
        
        try {
            // Usually composio.connectedAccounts.delete expects the connection ID or similar.
            // Let's first list the user's connections to find the matching one,
            // or use delete() directly if it supports entityId/appName
            
            const connections = await this.getConnections(userId);
            const targetConnection = (connections || []).find(c => (c.appId || c.appName || '').toLowerCase() === appName.toLowerCase() || (c.toolkit || '').toLowerCase() === appName.toLowerCase());
            
            if (targetConnection && targetConnection.id) {
                await this.composio.connectedAccounts.delete({ connectionId: targetConnection.id });
                logger.info(`🔌 Disconnected Composio app: ${appName}`);
                return true;
            }
            
            logger.warn(`⚠️ Could not find active connection for ${appName} to disconnect.`);
            return false;
        } catch (err) {
            logger.error(`❌ Composio disconnectApp failed: ${err.message}`);
            throw err;
        }
    }
    
    /**
     * Get the JSON Schema representations of all to     * This is mapped perfectly for Gemini / OpenAI function declarations.
     */
    async getConnectedToolsSchema(userId = 'default_user') {
        let allMappedTools = [];

        // 1. Ingest active local stdio MCP tools
        try {
            const localTools = await mcpClientService.getAllTools();
            if (localTools && localTools.length > 0) {
                localTools.forEach(tool => {
                    let params = tool.inputSchema ? JSON.parse(JSON.stringify(tool.inputSchema)) : { type: 'object', properties: {} };
                    if (params.$ref) delete params.$ref;
                    if (params.title) delete params.title;
                    if (params.description) delete params.description;

                    const cleanServer = tool.server.toLowerCase();
                    const actionName = `${cleanServer}_${tool.name.toLowerCase()}`;

                    allMappedTools.push({
                        name: actionName,
                        description: tool.description || `Execute local tool ${tool.name} on server ${tool.server}`,
                        parameters: params,
                        _originalActionName: tool.name,
                        _isMcp: true,
                        _mcpServer: tool.server
                    });
                });
            }
        } catch (err) {
            logger.warn(`⚠️ Composio getConnectedToolsSchema - Failed to ingest local MCP tools: ${err.message}`);
        }

        // 2. Ingest SaaS Oauth tools from Composio catalog
        if (this.composio) {
            try {
                const connections = await this.getConnections(userId);
                if (connections && connections.length > 0) {
                    const apps = connections.map(c => (c.appId || c.toolkit || c.appName).toLowerCase());
                    const rawTools = await this.composio.tools.getRawComposioTools({ toolkits: apps });
                    
                    rawTools.forEach(action => {
                        let params = action.inputParameters ? JSON.parse(JSON.stringify(action.inputParameters)) : { type: 'object', properties: {} };
                        if (params.$ref) delete params.$ref;
                        if (params.title) delete params.title;
                        if (params.description) delete params.description;
                        
                        allMappedTools.push({
                            name: action.slug.toLowerCase(),
                            description: action.description || `Execute ${action.name}`,
                            parameters: params,
                            _originalActionName: action.slug
                        });
                    });
                }
            } catch (err) {
                logger.error(`❌ Composio getConnectedToolsSchema failed: ${err.message}`);
            }
        }

        return allMappedTools;
    }
    
    /**
     * Execute a specific tool on behalf of the user.
     */
    async executeTool(actionName, args, userId = 'default_user') {
        try {
            logger.info(`🤖 Executing Action: ${actionName} for user: ${userId}`);

            const localTools = await mcpClientService.getAllTools();
            const matchedLocalTool = localTools.find(tool => {
                const cleanServer = tool.server.toLowerCase();
                const compositeName = `${cleanServer}_${tool.name.toLowerCase()}`;
                return compositeName === actionName.toLowerCase() || tool.name.toLowerCase() === actionName.toLowerCase();
            });

            if (matchedLocalTool) {
                logger.info(`🤖 Routing execution to local MCP client: ${matchedLocalTool.name} on server ${matchedLocalTool.server}`);
                const result = await mcpClientService.callTool(matchedLocalTool.server, matchedLocalTool.name, args);
                return result;
            }
        } catch (err) {
            logger.warn(`⚠️ executeTool - Local MCP detection failed: ${err.message}`);
        }

        if (!this.composio) throw new Error("Composio SDK not initialized");
        try {
            const result = await this.composio.tools.execute({
                action: actionName.toUpperCase(),
                params: args,
                entityId: userId
            });
            return result;
        } catch (err) {
            logger.error(`❌ Composio executeTool failed: ${err.message}`);
            throw err;
        }
    }
    
    /**
     * Get the available native AI actions (tools) for a specific app.
     */
    async getToolkitTools(appName) {
        if (!this.composio) return [];
        try {
            const rawTools = await this.composio.tools.getRawComposioTools({ toolkits: [appName.toLowerCase()] });
            return rawTools.map(action => ({
                id: action.slug,
                name: action.name,
                description: action.description
            }));
        } catch (err) {
            logger.warn(`⚠️ Failed to fetch tools for ${appName}: ${err.message}`);
            return [];
        }
    }

    /**
     * Get available triggers for a specific connected app.
     */
    async getAppTriggers(appName) {
        if (!this.composio) return [];
        try {
            // listEnum returns an array of string constants like "GITHUB_PULL_REQUEST_EVENT"
            const allTriggers = await this.composio.triggers.listEnum();
            
            // Filter triggers that start with the app name (e.g., GITHUB_)
            const prefix = `${appName.toUpperCase()}_`;
            const appTriggers = allTriggers.filter(t => t.startsWith(prefix));
            
            return appTriggers.map(t => ({
                id: t,
                name: t.replace(prefix, '').replace(/_/g, ' '),
                active: false // Would track active state from DB in prod
            }));
        } catch (err) {
            logger.warn(`⚠️ Failed to list triggers for ${appName}: ${err.message}`);
            return [];
        }
    }
    
    /**
     * Subscribe to incoming Webhook events from Composio natively.
     */
    async subscribeToTriggers(callback) {
        if (!this.composio) return;
        try {
            logger.info("📡 Subscribing to Composio global triggers via WebSockets...");
            await this.composio.triggers.subscribe(callback);
            logger.info("✅ Composio Triggers Connected");
        } catch (err) {
            logger.warn(`⚠️ Composio triggers failed to subscribe: ${err.message}`);
        }
    }

    /**
     * Internal fallback when API key is missing or network is down.
     * Keeps the frontend UI functional with the essential highly-demanded tools.
     */
    _getMockCuratedApps() {
        return [
            {
                key: 'github',
                name: 'GitHub',
                description: 'Sync repositories, read PRs, and commit code directly from the Swarm.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/github.png',
            },
            {
                key: 'slack',
                name: 'Slack',
                description: 'Read channel messages and send automated notifications across workspaces.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/slack.png',
            },
            {
                key: 'jira',
                name: 'Jira',
                description: 'Manage sprints, automatically update tickets, and track velocity.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/jira.png',
            },
            {
                key: 'notion',
                name: 'Notion',
                description: 'Search internal docs, embed knowledge base logic, and update pages.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/notion.png',
            },
            {
                key: 'linear',
                name: 'Linear',
                description: 'Modern issue tracking and project management for software teams.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/linear.png',
            },
            {
                key: 'google-drive',
                name: 'Google Drive',
                description: 'Read and write documents directly to Google Workspace.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/google-drive.png',
            },
            {
                key: 'salesforce',
                name: 'Salesforce',
                description: 'CRM integration to manage leads, contacts, and custom objects.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/salesforce.png',
            },
            {
                key: 'discord',
                name: 'Discord',
                description: 'Interact with community channels, manage roles, and deploy bots.',
                logo: 'https://raw.githubusercontent.com/ComposioHQ/composio/master/docs/docs/img/discord.png',
            }
        ];
    }
}

// Export singleton instance
export const composioService = new ComposioService();
