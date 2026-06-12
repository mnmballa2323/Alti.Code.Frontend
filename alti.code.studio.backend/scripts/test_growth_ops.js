/**
 * Test Harness for Tier 5, Tier 2, and Tier 4 Agents
 */

import { seoAgent } from '../src/app/modules/agents/seo.agent.js';
import { accessibilityAgent } from '../src/app/modules/agents/accessibility.agent.js';
import { onboardingAgent } from '../src/app/modules/agents/onboarding.agent.js';
import { apiDesignAgent } from '../src/app/modules/agents/api_design.agent.js';
import { incidentAgent } from '../src/app/modules/agents/incident.agent.js';
import { migrationAgent } from '../src/app/modules/agents/migration.agent.js';
import { costAgent } from '../src/app/modules/agents/cost.agent.js';

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

// Mock the Gemini service to bypass actual network API calls during unit testing
GeminiAiService.generateContent = async (prompt) => {
    return `[MOCK_GEMINI_RESPONSE_FOR: ${prompt.substring(0, 30)}...]`;
};

async function runTests() {
    console.log("=== STARTING GROWTH & OPS AGENT TESTS ===\n");

    const agents = [
        seoAgent, accessibilityAgent, onboardingAgent, apiDesignAgent,
        incidentAgent, migrationAgent, costAgent
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
            const resp = await agent.consult("Run an audit", [{ path: 'test.html', content: '<div></div>' }]);
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
