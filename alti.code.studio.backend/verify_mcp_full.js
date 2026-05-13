
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from 'path';
import fs from 'fs/promises';

async function verifyMCP() {
    console.log('🔌 Connecting to Alti.Code.Studio MCP Server...');

    // 1. Setup Transport
    const transport = new StdioClientTransport({
        command: "node",
        args: ["bin/mcp_server.js"]
    });

    const client = new Client(
        {
            name: "VerificationClient",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    try {
        await client.connect(transport);
        console.log('✅ Connected.');

        // 2. List Tools
        console.log('🛠️ Listing Tools...');
        const tools = await client.listTools();
        console.log(`Found ${tools.tools.length} tools:`, tools.tools.map(t => t.name).join(', '));

        // 3. Verify Indexer & RAG (The Cortex)
        console.log('\n🧠 Scenario 1: The Cortex (Index & Query)');

        // Create dummy data
        const tempDir = './temp_mcp_data';
        try { await fs.mkdir(tempDir); } catch { }
        await fs.writeFile(path.join(tempDir, 'secret_plan.txt'), 'The secret code is OMEGA-123.');

        console.log('   - Indexing...');
        await client.callTool({
            name: "index_repo",
            arguments: { path: path.resolve(tempDir) }
        });

        console.log('   - Querying...');
        // Mock search inside the server process? No, server runs in separate process.
        // We rely on the mock behavior we set up or real behavior.
        // Since `check_rag.js` modified the runtime memory of ITSELF, the server process 
        // will rely on REAL embedding or DEFAULT mock.
        // If Vertex is missing, it mocks.

        const queryResult = await client.callTool({
            name: "query_knowledge",
            arguments: { query: "What is the secret code?" }
        });
        console.log('   - Answer:', queryResult.content[0].text);


        // 4. Verify Security (Guardian)
        console.log('\n🛡️ Scenario 2: The Guardian');
        const auditResult = await client.callTool({
            name: "audit_code",
            arguments: {
                code: "const AWS_KEY = 'AKIA...';",
                context: "auth"
            }
        });
        console.log('   - Audit Result:', auditResult.content[0].text.substring(0, 100) + '...');


        // 5. Verify QA (QA Architect)
        console.log('\n🧪 Scenario 3: The QA Architect');
        const qaResult = await client.callTool({
            name: "generate_tests",
            arguments: { filePath: path.resolve(path.join(tempDir, 'secret_plan.txt')) } // Just to test flow
        });
        console.log('   - QA Result:', qaResult.content[0].text.substring(0, 100) + '...');

        console.log('\n✅ Verification Complete.');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await fs.rm('./temp_mcp_data', { recursive: true, force: true }).catch(() => { });
        process.exit(0);
    }
}

verifyMCP();
