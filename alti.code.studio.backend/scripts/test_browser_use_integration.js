import '../polyfill.js';
import { BrowserUseAgentService } from '../src/app/modules/browserUseAgent/browserUseAgent.service.js';
import { graphOrchestrator } from '../src/app/modules/agents/graph.orchestrator.js';

async function testBrowserUseIntegration() {
    let passed = 0;
    let failed = 0;

    console.log('🚀 Testing Browser-Use Agent Backend Integration...\n');

    function assert(condition, label) {
        if (condition) {
            console.log(`  ✅ ${label}`);
            passed++;
        } else {
            console.error(`  ❌ ${label}`);
            failed++;
        }
    }

    try {
        // Test Service methods existence
        assert(typeof BrowserUseAgentService.runBrowserTask === 'function', 'BrowserUseAgentService: runBrowserTask method exists');
        assert(typeof BrowserUseAgentService.getBrowserTaskStatus === 'function', 'BrowserUseAgentService: getBrowserTaskStatus method exists');

        // Test GraphOrchestrator integration is loaded successfully
        assert(graphOrchestrator !== undefined, 'GraphOrchestrator is loaded successfully');

    } catch (e) {
        console.error('❌ Unexpected error during verification:', e);
        failed++;
    }

    console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);

    if (failed > 0) {
        process.exit(1);
    }
    console.log('BROWSER-USE INTEGRATION VERIFICATION PASSED 🎉');
    process.exit(0);
}

testBrowserUseIntegration();
