
import { mcpServer } from './src/app/modules/mcp/mcp.server.js';
import { logger } from './src/shared/logger.js';
import path from 'path';
import fs from 'fs/promises';

async function verifyMCPFileSystem() {
    logger.info('📂 Verifying MCP FileSystem & Git Tools...');

    // Mock Request Handler
    const callTool = async (name, args) => {
        // We manually trigger the handler logic because we aren't spinning up a full transport
        // We'll access the handlers via the internal structure if possible, OR
        // simpler: we just unit test the tool definitions since we imported the server instance?
        // Actually, the server instance hides handlers in private/protected maps usually.
        // But we exported 'filesystemTool' and 'gitTool' in their files, so we can test them directly?
        // OR we can use the server's message handler if exposing it?

        // Let's rely on the fact we have the 'mcpServer' instance.
        // It has a .server propery.
        // We can simulate a request.
        // But the SDK makes it hard to inject requests without a transport.

        // Strategy: We will import the tools directly for this test to verify LOGIC, 
        // as `check_mcp.js` already verified the wiring.

        const { filesystemTool } = await import('./src/app/modules/mcp/tools/filesystem.tool.js');
        const { gitTool } = await import('./src/app/modules/mcp/tools/git.tool.js');

        if (name === 'filesystem') return filesystemTool.handler(args);
        if (name === 'git') return gitTool.handler(args);
    };

    try {
        // 1. FileSystem Test
        const testPath = 'mcp_test.txt';
        await callTool('filesystem', { action: 'write_file', path: testPath, content: 'Hello MCP' });
        logger.info('✅ FileSystem: Write success');

        const readRes = await callTool('filesystem', { action: 'read_file', path: testPath });
        if (readRes.content[0].text === 'Hello MCP') {
            logger.info('✅ FileSystem: Read success');
        } else {
            throw new Error('Read mismatch');
        }

        const listRes = await callTool('filesystem', { action: 'list_directory', path: '.' });
        if (listRes.content[0].text.includes('mcp_test.txt')) {
            logger.info('✅ FileSystem: List success');
        }

        // 2. Git Test
        const statusRes = await callTool('git', { action: 'git_status' });
        logger.info('✅ Git: Status success', statusRes.content[0].text.substring(0, 50) + '...');

        const logRes = await callTool('git', { action: 'git_log', limit: 1 });
        logger.info('✅ Git: Log success', logRes.content[0].text);

        // Cleanup
        await fs.unlink(path.resolve(testPath));
        logger.info('🎉 MCP FileSystem & Git Verification Complete!');

    } catch (error) {
        logger.error('❌ Verification Failed', error);
        process.exit(1);
    }
}

verifyMCPFileSystem();
