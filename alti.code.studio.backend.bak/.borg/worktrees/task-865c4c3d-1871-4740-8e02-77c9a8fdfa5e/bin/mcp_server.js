#!/usr/bin/env node

import { mcpServer } from '../src/app/modules/mcp/mcp.server.js';
import { logger } from '../src/shared/logger.js';

async function main() {
    // logger.info('MCP Server Starting in Stdio Mode...');
    try {
        await mcpServer.startStdio();
    } catch (error) {
        logger.error('MCP Server Fatal Error', error);
        process.exit(1);
    }
}

main();
