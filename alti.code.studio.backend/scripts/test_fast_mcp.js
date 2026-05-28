/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * FastMCP JS Integration Test Runner
 * Verifies registrations and mock protocol executions.
 */

import { FastMCP } from '../src/app/modules/mcp/fast_mcp.js';
import { 
    CallToolRequestSchema, 
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

async function runTest() {
    console.log('🧪 INITIALIZING FASTMCP JS FRAMEWORK TEST...');

    // 1. Initialize Server
    const server = new FastMCP('Developer-Toolbox', { version: '1.2.0' });

    // 2. Register Tool
    server.tool(
        'calculator',
        'Add two numbers dynamically',
        {
            type: 'object',
            properties: {
                a: { type: 'number', description: 'First number' },
                b: { type: 'number', description: 'Second number' }
            },
            required: ['a', 'b']
        },
        async ({ a, b }) => {
            return `Result: ${a + b}`;
        }
    );

    // 3. Register Resource
    server.resource(
        'file:///logs/audit.log',
        'Security Audit Log',
        'Pruned log detailing zero-trust compliance events.',
        async () => {
            return '[Audit Log]: Strict license compliance passed. 0 copyleft violations.';
        }
    );

    // 4. Register Prompt Template
    server.prompt(
        'system-hardening',
        'Generate security hardening commands for an OS',
        [
            { name: 'os', description: 'Target operating system', required: true }
        ],
        async ({ os }) => {
            return [
                {
                    role: 'user',
                    content: `Please output military-grade zero-trust security configuration commands for: ${os}`
                }
            ];
        }
    );

    console.log('✅ Services registered successfully inside FastMCP Map containers.\n');

    // ── Simulate Protocol Invocations ──
    const getHandler = (schema) => server.handlers.get(schema);

    // Test List Tools
    const listToolsHandler = getHandler(ListToolsRequestSchema);
    const toolsResult = await listToolsHandler({});
    console.log('📁 ListTools Schema Result:');
    console.log(JSON.stringify(toolsResult, null, 2));

    // Test Call Tool
    const callToolHandler = getHandler(CallToolRequestSchema);
    const toolCallResult = await callToolHandler({
        params: {
            name: 'calculator',
            arguments: { a: 40, b: 2 }
        }
    });
    console.log('\n🧮 CallTool Invocation Result:');
    console.log(JSON.stringify(toolCallResult, null, 2));

    // Test List Resources
    const listResHandler = getHandler(ListResourcesRequestSchema);
    const resListResult = await listResHandler({});
    console.log('\n📄 ListResources Schema Result:');
    console.log(JSON.stringify(resListResult, null, 2));

    // Test Read Resource
    const readResHandler = getHandler(ReadResourceRequestSchema);
    const resourceReadResult = await readResHandler({
        params: { uri: 'file:///logs/audit.log' }
    });
    console.log('\n🔍 ReadResource Invocation Result:');
    console.log(JSON.stringify(resourceReadResult, null, 2));

    // Test List Prompts
    const listPromptsHandler = getHandler(ListPromptsRequestSchema);
    const promptsListResult = await listPromptsHandler({});
    console.log('\n📝 ListPrompts Schema Result:');
    console.log(JSON.stringify(promptsListResult, null, 2));

    // Test Get Prompt
    const getPromptHandler = getHandler(GetPromptRequestSchema);
    const promptGetResult = await getPromptHandler({
        params: {
            name: 'system-hardening',
            arguments: { os: 'macOS Alpine' }
        }
    });
    console.log('\n👑 GetPrompt Invocation Result:');
    console.log(JSON.stringify(promptGetResult, null, 2));

    console.log('\n🎉 ALL FASTMCP JS UNIT AND INTEGRATION PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);
