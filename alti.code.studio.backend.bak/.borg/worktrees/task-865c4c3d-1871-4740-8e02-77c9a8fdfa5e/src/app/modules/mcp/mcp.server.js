/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { logger } from '../../../shared/logger.js';
import { treeSitterService } from '../refactorAgent/treeSitter.service.js';
import { dockerService } from '../../../shared/docker.service.js';
import { GuardianService } from '../guardian/guardian.service.js';
import { filesystemTool } from './tools/filesystem.tool.js';
import { gitTool } from './tools/git.tool.js';
import { generateTestsTool } from './tools/qa.tool.js';
import { indexerTool } from './tools/indexer.tool.js';
import { contextTool } from './tools/context.tool.js';
import { browserTool } from './tools/browser.tool.js';
import { visionTool } from './tools/vision.tool.js';
import { projectTool } from './tools/project.tool.js';
import { composerTool } from './tools/composer.tool.js';
import { completionTool } from './tools/completion.tool.js';
import { prTool } from './tools/pr.tool.js';
import { specKitTool } from './tools/speckit.tool.js';
import { depTool } from './tools/dep.tool.js';
import { deployTool } from './tools/deploy.tool.js';
import { loopTool } from './tools/loop.tool.js';
import { schemaTool } from './tools/schema.tool.js';
import { swarmTool } from './tools/swarm.tool.js';
import { authTools } from './tools/auth.tool.js';
import { auditService } from '../audit/audit.service.js';

class AltiMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: "Alti.Code.Studio.Backend",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        this.setupHandlers();
    }

    setupHandlers() {
        // Define Local Tools
        this.localTools = [
            {
                name: "parse_code",
                description: "Parse code using Tree-sitter AST",
                inputSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                        language: { type: "string", default: "javascript" }
                    },
                    required: ["code"]
                }
            },
            {
                name: "list_containers",
                description: "List active Docker containers",
                inputSchema: {
                    type: "object",
                    properties: {
                        all: { type: "boolean", description: "Show all containers (default false)" }
                    }
                }
            },
            {
                name: "audit_code",
                description: "Audit code for security vulnerabilities and quality issues",
                inputSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                        context: { type: "string", description: "Context of the code (e.g., 'auth module')" }
                    },
                    required: ["code"]
                }
            },
            {
                name: "analyze_repo",
                description: "Analyze entire repository (Placeholder)",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string" }
                    }
                }
            },
            {
                name: filesystemTool.name,
                description: filesystemTool.description,
                inputSchema: filesystemTool.inputSchema
            },
            {
                name: gitTool.name,
                description: gitTool.description,
                inputSchema: gitTool.inputSchema
            },
            {
                name: generateTestsTool.name,
                description: generateTestsTool.description,
                inputSchema: generateTestsTool.inputSchema
            },
            {
                name: indexerTool.name,
                description: indexerTool.description,
                inputSchema: indexerTool.inputSchema
            },
            {
                name: contextTool.name,
                description: contextTool.description,
                inputSchema: contextTool.inputSchema
            },
            {
                name: browserTool.name,
                description: browserTool.description,
                inputSchema: browserTool.inputSchema
            },
            {
                name: visionTool.name,
                description: visionTool.description,
                inputSchema: visionTool.inputSchema
            },
            {
                name: projectTool.name,
                description: projectTool.description,
                inputSchema: projectTool.inputSchema
            },
            {
                name: composerTool.name,
                description: composerTool.description,
                inputSchema: composerTool.inputSchema
            },
            {
                name: completionTool.name,
                description: completionTool.description,
                inputSchema: completionTool.inputSchema
            },
            {
                name: prTool.name,
                description: prTool.description,
                inputSchema: prTool.inputSchema
            },
            {
                name: specKitTool.name,
                description: specKitTool.description,
                inputSchema: specKitTool.inputSchema
            },
            {
                name: depTool.name,
                description: depTool.description,
                inputSchema: depTool.inputSchema
            },
            {
                name: deployTool.name,
                description: deployTool.description,
                inputSchema: deployTool.inputSchema
            },
            {
                name: loopTool.name,
                description: loopTool.description,
                inputSchema: loopTool.inputSchema
            },
            {
                name: schemaTool.name,
                description: schemaTool.description,
                inputSchema: schemaTool.inputSchema
            },
            {
                name: swarmTool.name,
                description: swarmTool.description,
                inputSchema: swarmTool.inputSchema
            },
            ...authTools
        ];

        // List Tools Handler
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.localTools
            };
        });

        // Call Tool Handler
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            return await this.executeToolLocal(name, args);
        });
    }

    getLocalTools() {
        return this.localTools;
    }

    async executeToolLocal(name, args) {
        logger.info(`MCP: Tool called '${name}'`, args);
        await auditService.logAction('system', `call_tool:${name}`, args, 'ATTEMPT');

        try {
            // Check dynamic tools first
            const authTool = authTools.find(t => t.name === name);
            if (authTool) return await authTool.handler(args);

            switch (name) {
                case "parse_code": {
                    const { code, language } = args;
                    const lang = language || 'javascript';
                    await treeSitterService.init();
                    const tree = await treeSitterService.parse(code, lang);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    rootType: tree.rootNode.type,
                                    nodeCount: tree.rootNode.childCount,
                                    treeString: tree.rootNode.toString()
                                }, null, 2)
                            }
                        ]
                    };
                }
                case "list_containers": {
                    const containers = await dockerService.listContainers(args.all || false);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(containers, null, 2)
                            }
                        ]
                    };
                }
                case "audit_code": {
                    const { code, context } = args;
                    const result = await GuardianService.auditCode(code, context || 'general');
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(result, null, 2)
                            }
                        ]
                    };
                }
                case "analyze_repo":
                    return { content: [{ type: "text", text: "Repo analysis not implemented yet." }] };
                case "filesystem":
                    return await filesystemTool.handler(args);
                case "git":
                    return await gitTool.handler(args);
                case "generate_tests":
                    return await generateTestsTool.handler(args);
                case "index_repo":
                    return await indexerTool.handler(args);
                case "query_knowledge":
                    return await contextTool.handler(args);
                case "browse_web":
                    return await browserTool.handler(args);
                case "analyze_image":
                    return await visionTool.handler(args);
                case "manage_task":
                    return await projectTool.handler(args);
                case "compose_feature":
                    return await composerTool.handler(args);
                case "complete_code":
                    return await completionTool.handler(args);
                case "write_pr":
                    return await prTool.handler(args);
                case "draft_spec":
                case "speckit_specify":
                    return await specKitTool.handler(args);
                case "audit_deps":
                    return await depTool.handler(args);
                case "deploy_site":
                    return await deployTool.handler(args);
                case "auto_fix_loop":
                    return await loopTool.handler(args);
                case "manage_schema":
                    return await schemaTool.handler(args);
                case "run_swarm":
                    return await swarmTool.handler(args);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        } catch (error) {
            logger.error(`MCP Tool Error (${name})`, error);
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    }

    async startStdio() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        logger.info("MCP Server running on Stdio");
    }

    /**
     * Create an SSE Transport handler for Express
     */
    createSSEHandler() {
        let transport;

        return async (req, res) => {
            logger.info("MCP: New SSE Connection Request");

            transport = new SSEServerTransport("/mcp/messages", res);
            await this.server.connect(transport);

            // Handle client disconnect
            req.on("close", () => {
                logger.info("MCP: SSE Connection closed");
                // transport.close(); // SDK handles this?
            });
        };
    }

    /**
     * Handle incoming POST messages for the SSE transport
     */
    async handleMessage(req, res) {
        logger.warn('MCP: HTTP Message handling requires persistent transport mapping. Implemented basic setup.');
        res.status(501).send('Not fully implemented yet');
    }
}

export const mcpServer = new AltiMCPServer();
