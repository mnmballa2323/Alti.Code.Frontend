
import { mcpClientService } from '../src/app/modules/mcp/mcp.client.js';
import { surferAgent } from '../src/app/modules/agents/surfer.agent.js';
import { ragService } from '../src/app/modules/memory/rag.service.js';

async function testIntegrations() {
    const start = Date.now();
    let passed = 0;
    let failed = 0;

    console.log('🚀 Testing Advanced Integrations...\n');

    function assert(condition, label, detail = '') {
        if (condition) {
            console.log(`  ✅ ${label}`);
            passed++;
        } else {
            console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
            failed++;
        }
    }

    try {
        // MCP Client
        assert(mcpClientService !== null && mcpClientService !== undefined, 'MCP Client Service instantiated');
        assert(typeof mcpClientService.connect === 'function', 'MCP: connect() method exists');
        assert(typeof mcpClientService.disconnect === 'function', 'MCP: disconnect() method exists');
        assert(typeof mcpClientService.connectPresets === 'function', 'MCP: connectPresets() method exists');
        assert(typeof mcpClientService.getAllTools === 'function', 'MCP: getAllTools() method exists');

        // Surfer Agent
        assert(surferAgent !== null && surferAgent !== undefined, 'Surfer Agent instantiated');
        // surfWeb() is the primary search method; research() was an old alias removed in R12
        assert(typeof surferAgent.surfWeb === 'function', 'Surfer Agent: surfWeb() method exists');
        assert(typeof surferAgent.process === 'function', 'Surfer Agent: process() graph method exists');

        // RAG Service
        assert(ragService !== null && ragService !== undefined, 'RAG Service instantiated');
        assert(typeof ragService.query === 'function', 'RAG Service: query() method exists');
        assert(typeof ragService.createIndex === 'function', 'RAG Service: createIndex() method exists');
        assert(typeof ragService.clearIndex === 'function', 'RAG Service: clearIndex() method exists');


        // MCP preset output structure
        const presets = await mcpClientService.connectPresets();
        assert(Array.isArray(presets), 'MCP: connectPresets() returns an array');
        assert(
            presets.every(r => r.name && r.status),
            'MCP: each preset result has name and status fields',
            JSON.stringify(presets)
        );

        // MCP getAllTools shape
        const tools = await mcpClientService.getAllTools();
        assert(Array.isArray(tools), 'MCP: getAllTools() returns an array');


    } catch (error) {
        console.error('\n❌ Unexpected error during integration tests:', error);
        failed++;
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n--- Results: ${passed} passed, ${failed} failed | Duration: ${duration}s ---\n`);

    if (failed > 0) {
        console.error('INTEGRATION TESTS FAILED');
        process.exit(1);
    }

    console.log('ALL INTEGRATION TESTS PASSED 🎉');
    process.exit(0);
}

testIntegrations();
