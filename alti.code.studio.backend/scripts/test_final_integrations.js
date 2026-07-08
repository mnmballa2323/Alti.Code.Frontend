import { TemporalAgentService } from '../src/app/modules/temporalAgent/temporalAgent.service.js';
import { LangGraphAgentService } from '../src/app/modules/langGraphAgent/langGraphAgent.service.js';
import { Mem0AgentService } from '../src/app/modules/mem0Agent/mem0Agent.service.js';
import { LangfuseAgentService } from '../src/app/modules/langfuseAgent/langfuseAgent.service.js';
import { TabbyAgentService } from '../src/app/modules/tabbyAgent/tabbyAgent.service.js';
import { BrowserUseAgentService } from '../src/app/modules/browserUseAgent/browserUseAgent.service.js';
import { Crawl4AiAgentService } from '../src/app/modules/crawl4aiAgent/crawl4aiAgent.service.js';
import { McpAgentService } from '../src/app/modules/mcpAgent/mcpAgent.service.js';
import { DspyAgentService } from '../src/app/modules/dspyAgent/dspyAgent.service.js';
import { UnstructuredAgentService } from '../src/app/modules/unstructuredAgent/unstructuredAgent.service.js';
import { PromptfooAgentService } from '../src/app/modules/promptfooAgent/promptfooAgent.service.js';
import { GeminiExtensionService } from '../src/app/modules/geminiExtensions/geminiExtension.service.js';
import { LitellmGatewayService } from '../src/app/modules/litellmGateway/litellmGateway.service.js';
import { QdrantService } from '../src/app/modules/qdrantAgent/qdrant.service.js';
import { GdcAgentService } from '../src/app/modules/gdcAgent/gdcAgent.service.js';
import { SearxngAgentService } from '../src/app/modules/searxngAgent/searxngAgent.service.js';
import { OpenInterpreterAgentService } from '../src/app/modules/openInterpreterAgent/openInterpreterAgent.service.js';
import { ObservabilityService } from '../src/app/modules/observability/observability.service.js';
import { VoiceAgentService } from '../src/app/modules/voiceAgent/voiceAgent.service.js';

async function testAllNewIntegrations() {
    let passed = 0;
    let failed = 0;

    console.log('🚀 Testing All New Dockerized API Integrations...\n');

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
        // Phase 6
        assert(typeof TemporalAgentService.startWorkflow === 'function', 'Temporal: startWorkflow exists');
        assert(typeof LangGraphAgentService.runStatefulGraph === 'function', 'LangGraph: runStatefulGraph exists');

        // Phase 7
        assert(typeof Mem0AgentService.addMemory === 'function', 'Mem0: addMemory exists');
        assert(typeof LangfuseAgentService.traceExecution === 'function', 'Langfuse: traceExecution exists');

        // Phase 8
        assert(typeof TabbyAgentService.getCodeCompletion === 'function', 'Tabby: getCodeCompletion exists');

        // Phase 9
        assert(typeof BrowserUseAgentService.runBrowserTask === 'function', 'BrowserUse: runBrowserTask exists');
        assert(typeof Crawl4AiAgentService.crawlAndExtract === 'function', 'Crawl4Ai: crawlAndExtract exists');

        // Phase 10
        assert(typeof McpAgentService.executeMcpTool === 'function', 'MCP: executeMcpTool exists');

        // Phase 11
        assert(typeof DspyAgentService.optimizePrompt === 'function', 'DSPy: optimizePrompt exists');
        assert(typeof UnstructuredAgentService.extractDocument === 'function', 'Unstructured: extractDocument exists');

        // Phase 12
        assert(typeof PromptfooAgentService.runEvaluation === 'function', 'Promptfoo: runEvaluation exists');

        // Phase 13
        assert(typeof GeminiExtensionService.listExtensions === 'function', 'GeminiCLI: listExtensions exists');

        // Phase 14
        assert(typeof LitellmGatewayService.routeCompletion === 'function', 'LiteLLM: routeCompletion exists');

        // Phase 15
        assert(typeof QdrantService.createCollection === 'function', 'Qdrant: createCollection exists');

        // Phase 17
        assert(typeof GdcAgentService.generateCompletion === 'function', 'GDC: generateCompletion exists');

        // Phase 18
        assert(typeof SearxngAgentService.searchWeb === 'function', 'SearXNG: searchWeb exists');

        // Phase 19
        assert(typeof OpenInterpreterAgentService.executeCode === 'function', 'OpenInterpreter: executeCode exists');

        // Phase 21
        assert(typeof ObservabilityService.getContainerCpuUsage === 'function', 'Observability (Prometheus): getContainerCpuUsage exists');

        // Phase 22
        assert(typeof VoiceAgentService.transcribeAudio === 'function', 'Voice (Whisper): transcribeAudio exists');

    } catch (e) {
        console.error('❌ Unexpected error:', e);
        failed++;
    }

    console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);

    if (failed > 0) process.exit(1);
    console.log('ALL API STRUCTURE TESTS PASSED 🎉');
    process.exit(0);
}

testAllNewIntegrations();
