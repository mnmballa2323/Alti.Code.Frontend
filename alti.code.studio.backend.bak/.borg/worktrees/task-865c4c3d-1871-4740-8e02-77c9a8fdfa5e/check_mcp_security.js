
import { spawn } from 'child_process';
import path from 'path';

const serverPath = path.resolve('start_mcp_stdio.js');
const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit']
});

let buffer = '';

child.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;

    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const msg = JSON.parse(line);
            handleMessage(msg);
        } catch (e) {
            console.log('DEBUG: Server Output:', line);
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
    // console.log(`📩 Received ID ${msg.id}`);

    if (msg.id === 0 && msg.result) {
        console.log('✅ Initialized!');
        // Call audit_code with UNSAFE code
        console.log('Testing audit_code with UNSAFE code...');
        send('tools/call', {
            name: 'audit_code',
            arguments: {
                code: 'const key = "AWS_SECRET_KEY";',
                context: 'auth-service'
            }
        });
    } else if (msg.id === 1 && msg.result) {
        // Parse the embedded JSON result from the tool
        const toolResult = JSON.parse(msg.result.content[0].text);
        console.log('Tool Result (Unsafe):', toolResult.safe ? 'SAFE' : 'UNSAFE');

        if (!toolResult.safe && toolResult.vulnerabilities.some(v => v.includes('AWS Credential'))) {
            console.log('✅ MCP correctly reported UNSAFE code.');
        } else {
            console.error('❌ MCP failed to report UNSAFE code.', toolResult);
            process.exit(1);
        }

        // Call audit_code with SAFE code
        console.log('Testing audit_code with SAFE code...');
        send('tools/call', {
            name: 'audit_code',
            arguments: {
                code: 'function add(a,b) { return a+b; }',
                context: 'math'
            }
        });

    } else if (msg.id === 2 && msg.result) {
        const toolResult = JSON.parse(msg.result.content[0].text);
        console.log('Tool Result (Safe):', toolResult.safe ? 'SAFE' : 'UNSAFE');

        if (toolResult.safe) {
            console.log('✅ MCP correctly reported SAFE code.');
            process.exit(0);
        } else {
            console.error('❌ MCP rejected safe code.', toolResult);
            process.exit(1);
        }
    }
}

// Start sequence
console.log('🚀 Starting MCP Security Verification...');
send('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0" }
});

setTimeout(() => {
    console.log('Timeout waiting for response');
    child.kill();
    process.exit(1);
}, 30000);
