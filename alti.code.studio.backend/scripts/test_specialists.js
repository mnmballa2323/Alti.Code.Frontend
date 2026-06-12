/**
 * Test Harness for Tier 6 & Tier 7 Specialist Agents
 */

import { awsAgent } from '../src/app/modules/agents/aws.agent.js';
import { gcpAgent } from '../src/app/modules/agents/gcp.agent.js';
import { azureAgent } from '../src/app/modules/agents/azure.agent.js';
import { typescriptAgent } from '../src/app/modules/agents/typescript.agent.js';
import { pythonAgent } from '../src/app/modules/agents/python.agent.js';
import { rustAgent } from '../src/app/modules/agents/rust.agent.js';
import { golangAgent } from '../src/app/modules/agents/golang.agent.js';

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

// Mock the Gemini service to bypass actual network API calls during unit testing
GeminiAiService.generateContent = async (prompt) => {
    return `[MOCK_GEMINI_RESPONSE_FOR: ${prompt.substring(0, 30)}...]`;
};

async function runTests() {
    console.log("=== STARTING SPECIALIST AGENT TESTS ===\n");

    const agents = [
        awsAgent, gcpAgent, azureAgent,
        typescriptAgent, pythonAgent, rustAgent, golangAgent
    ];

    let passed = 0;

    for (const agent of agents) {
        console.log(`-> Testing ${agent.name}...`);

        // Assert inheritance & fields
        if (!agent.description || !agent.preamble) {
            console.error(`❌ ${agent.name} is missing core fields (description/preamble).`);
            continue;
        }

        try {
            const resp = await agent.consult("Deploy a web server", [{ path: 'main.txt', content: 'hello world' }]);
            const content = typeof resp === 'string' ? resp : (resp?.content || '');

            if (content.includes('[MOCK_GEMINI_RESPONSE_FOR')) {
                console.log(`✅ ${agent.name} PASS (Gemini pipeline linked successfully)`);
                passed++;
            } else {
                console.error(`❌ ${agent.name} FAIL (Invalid response pipe)`);
            }
        } catch (e) {
            console.error(`❌ ${agent.name} FAIL: ${e.message}`);
        }
    }

    console.log(`\n=== ALL TESTS COMPLETED: ${passed}/${agents.length} PASSED ===`);
    if (passed !== agents.length) process.exit(1);
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
