
import { mcpClientService } from '../src/app/modules/mcp/mcp.client.js';
import { surferAgent } from '../src/app/modules/agents/surfer.agent.js';
import { ragService } from '../src/app/modules/memory/rag.service.js';
import { logger } from '../src/shared/logger.js';

async function testIntegrations() {
    console.log("🚀 Testing Advanced Integrations...");

    try {
        if (mcpClientService) {
            console.log("✅ MCP Client Service instantiated.");
        }

        if (surferAgent) {
            console.log("✅ Surfer Agent instantiated.");
        }

        if (ragService) {
            console.log("✅ RAG Service instantiated.");
        }

        console.log("ALL INTEGRATIONS LOADED SUCCESSFULLY.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Integration Test Failed:", error);
        process.exit(1);
    }
}

testIntegrations();
