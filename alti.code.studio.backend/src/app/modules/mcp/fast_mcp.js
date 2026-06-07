/**
 * Copyright (c) 2026 Inso Code
 * 
 * FastMCP JS — High-Fidelity JavaScript Model Context Protocol Server Framework
 * 
 * Emulates Prefect's popular Python `fastmcp` decorator-style API natively
 * in Node.js, leveraging the official `@modelcontextprotocol/sdk`.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
    CallToolRequestSchema, 
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

export class FastMCP {
    /**
     * Create a new FastMCP server.
     * @param {string} name - Name of the MCP server
     * @param {object} options - Configuration options (version, etc.)
     */
    constructor(name, options = {}) {
        this.name = name;
        this.version = options.version || '1.0.0';
        this.tools = new Map();
        this.resources = new Map();
        this.prompts = new Map();
        this.handlers = new Map();

        this.server = new Server(
            { name: this.name, version: this.version },
            { capabilities: { tools: {}, resources: {}, prompts: {} } }
        );

        this._setupRequestHandlers();
    }

    /**
     * Registers a new tool.
     * @param {string} name - Name of the tool
     * @param {string} description - Brief description of what the tool does
     * @param {object} inputSchema - JSON Schema outlining expected parameters
     * @param {Function} handler - The execution handler function
     */
    tool(name, description, inputSchema, handler) {
        if (this.tools.has(name)) {
            throw new Error(`Tool [${name}] is already registered.`);
        }
        this.tools.set(name, { name, description, inputSchema, handler });
        return this;
    }

    /**
     * Registers a new read-only resource.
     * @param {string} uri - Unique URI identifier for the resource (e.g. "file:///logs")
     * @param {string} name - Name of the resource
     * @param {string} description - Brief description of the resource
     * @param {Function} handler - The read execution handler function returning resource contents
     */
    resource(uri, name, description, handler) {
        if (this.resources.has(uri)) {
            throw new Error(`Resource [${uri}] is already registered.`);
        }
        this.resources.set(uri, { uri, name, description, handler });
        return this;
    }

    /**
     * Registers a pre-defined system prompt template.
     * @param {string} name - Name of the prompt template
     * @param {string} description - Brief description
     * @param {Array} argumentsList - List of argument objects: { name, description, required }
     * @param {Function} handler - Handler function that formats and returns the prompt messages
     */
    prompt(name, description, argumentsList, handler) {
        if (this.prompts.has(name)) {
            throw new Error(`Prompt [${name}] is already registered.`);
        }
        this.prompts.set(name, { name, description, arguments: argumentsList, handler });
        return this;
    }

    /**
     * Internal: Connects official SDK request schemas to FastMCP maps.
     */
    _setupRequestHandlers() {
        // Helper to register handler both in official SDK and local test map
        const setHandler = (schema, handlerFn) => {
            this.server.setRequestHandler(schema, handlerFn);
            this.handlers.set(schema, handlerFn);
        };

        // ── TOOLS HANDLERS ──
        setHandler(ListToolsRequestSchema, async () => {
            const toolsList = Array.from(this.tools.values()).map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema || { type: 'object', properties: {} }
            }));
            return { tools: toolsList };
        });

        setHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const tool = this.tools.get(name);
            if (!tool) {
                throw new Error(`Tool [${name}] not found.`);
            }

            try {
                const result = await tool.handler(args || {});
                return {
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Execution Error: ${err.message}`
                        }
                    ],
                    isError: true
                };
            }
        });

        // ── RESOURCES HANDLERS ──
        setHandler(ListResourcesRequestSchema, async () => {
            const resourcesList = Array.from(this.resources.values()).map(r => ({
                uri: r.uri,
                name: r.name,
                description: r.description
            }));
            return { resources: resourcesList };
        });

        setHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            const resource = this.resources.get(uri);
            if (!resource) {
                throw new Error(`Resource [${uri}] not found.`);
            }

            try {
                const content = await resource.handler(uri);
                return {
                    contents: [
                        {
                            uri,
                            text: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
                        }
                    ]
                };
            } catch (err) {
                throw new Error(`Failed to read resource [${uri}]: ${err.message}`);
            }
        });

        // ── PROMPTS HANDLERS ──
        setHandler(ListPromptsRequestSchema, async () => {
            const promptsList = Array.from(this.prompts.values()).map(p => ({
                name: p.name,
                description: p.description,
                arguments: p.arguments
            }));
            return { prompts: promptsList };
        });

        setHandler(GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const promptDef = this.prompts.get(name);
            if (!promptDef) {
                throw new Error(`Prompt template [${name}] not found.`);
            }

            try {
                const messages = await promptDef.handler(args || {});
                return { messages };
            } catch (err) {
                throw new Error(`Failed to format prompt [${name}]: ${err.message}`);
            }
        });
    }

    /**
     * Start the FastMCP server over standard input/output (stdio) transport.
     */
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error(`🚀 FastMCP Server [${this.name}] running on Stdio transport.`);
    }
}
