
import { spawn } from 'child_process';
import path from 'path';

const serverPath = path.resolve('start_mcp_stdio.js');
const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit'] // pipe stdin/stdout, inherit stderr for logs
});

let buffer = '';

child.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;

    // Simple JSON-RPC message framing (newline delimited usually, or Content-Length)
    // The SDK uses JSON-RPC 2.0. Stdio transport often uses line-delimited JSON.
    // Let's try to parse lines.
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const msg = JSON.parse(line);
            handleMessage(msg);
        } catch (e) {
            // console.log('Received non-JSON:', line);
        }
    }
});

let messageId = 0;
function send(method, params) {
    const msg = {
        jsonrpc: "2.0",
        id: messageId++,
        method,
        params
    };
    child.stdin.write(JSON.stringify(msg) + '\n');
}

function handleMessage(msg) {
    console.log(`📩 Received:`, JSON.stringify(msg).slice(0, 100) + '...');

    if (msg.id === 0 && msg.result) {
        console.log('✅ Initialized!');
        // List tools
        send('tools/list', {});
    } else if (msg.id === 1 && msg.result) {
        console.log('✅ Tools Listed:', msg.result.tools.map(t => t.name));
        // Call tool
        send('tools/call', {
            name: 'parse_code',
            arguments: {
                code: 'function hello() { return "world"; }',
                language: 'javascript'
            }
        });
        console.log('✅ Tool Called Result (parse_code):', JSON.parse(msg.result.content[0].text).rootType);

        // Call Docker tool
        send('tools/call', {
            name: 'list_containers',
            arguments: { all: true }
        });
    } else if (msg.id === 2 && msg.result) {
        console.log('✅ Tool Called Result (list_containers):', msg.result.content[0].text);
        process.exit(0);
    }
}

// Start sequence
console.log('🚀 Starting MCP Verification...');
send('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0" }
});

setTimeout(() => {
    console.log('Timeout waiting for response');
    child.kill();
    process.exit(1);
}, 5000);
