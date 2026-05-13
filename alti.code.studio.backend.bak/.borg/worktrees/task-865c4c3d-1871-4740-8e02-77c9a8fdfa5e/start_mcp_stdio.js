
import { mcpServer } from './src/app/modules/mcp/mcp.server.js';
import { logger } from './src/shared/logger.js';

logger.info("Starting MCP Server in Stdio mode...");
mcpServer.startStdio().catch(err => {
    logger.error("Failed to start MCP Server", err);
    process.exit(1);
});
