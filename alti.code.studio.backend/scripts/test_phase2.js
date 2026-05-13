
import { graphOrchestrator } from '../src/app/modules/agents/graph.orchestrator.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { surferAgent } from '../src/app/modules/agents/surfer.agent.js';
import { sirenAgent } from '../src/app/modules/agents/siren.agent.js';
import { logger } from '../src/shared/logger.js';

// Mock dependencies
GeminiAiService.generateContent = async (prompt) => {
    console.log('🤖 Mock Gemini: Generating Plan...');
    return JSON.stringify({
        steps: [
            { agent: 'siren', action: 'speak', args: { text: 'Test speaking' } },
            { agent: 'surfer', action: 'research', args: { url: 'http://test.com', query: 'test' } }
        ]
    });
};

// Mock Agent Methods to avoid side effects
sirenAgent.speak = async (text) => {
    console.log(`🗣️ Mock Siren: Speaking "${text}"`);
    return "Spoken.";
};

surferAgent.research = async (url, query) => {
    console.log(`🏄 Mock Surfer: Visiting ${url}`);
    return "Research complete.";
};

// Mock Guardian to always approve
import { guardianAgent } from '../src/app/modules/agents/guardian.agent.js';
guardianAgent.reviewPlan = async () => {
    return { approved: true };
};

console.log('🚀 Starting Phase 2 Verification: Dynamic Orchestrator');

(async () => {
    try {
        const results = await graphOrchestrator.run("Test Goal");
        console.log('✅ Verification Completed Successfully');
        // console.log('Results:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
})();
