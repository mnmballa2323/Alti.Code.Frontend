/**
 * Test Harness for Tier 14: AI/ML, Mobile, Testing & Data Agents
 */

import { langchainAgent } from '../src/app/modules/agents/langchain.agent.js';
import { mlopsAgent } from '../src/app/modules/agents/mlops.agent.js';
import { promptengAgent } from '../src/app/modules/agents/prompteng.agent.js';
import { reactnativeAgent } from '../src/app/modules/agents/reactnative.agent.js';
import { flutterAgent } from '../src/app/modules/agents/flutter.agent.js';
import { pwaAgent } from '../src/app/modules/agents/pwa.agent.js';
import { vitestAgent } from '../src/app/modules/agents/vitest.agent.js';
import { playwrightAgent } from '../src/app/modules/agents/playwright.agent.js';
import { sqlAgent } from '../src/app/modules/agents/sql.agent.js';
import { elasticsearchAgent } from '../src/app/modules/agents/elasticsearch.agent.js';
import { kafkaAgent } from '../src/app/modules/agents/kafka.agent.js';

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

GeminiAiService.generateContent = async (prompt) =>
    `[MOCK_GEMINI_RESPONSE_FOR: ${prompt.substring(0, 35)}...]`;

async function runTests() {
    console.log("=== TIER 14: AI/ML, MOBILE, TESTING & DATA AGENT TESTS ===\n");

    const agents = [
        langchainAgent, mlopsAgent, promptengAgent,
        reactnativeAgent, flutterAgent, pwaAgent,
        vitestAgent, playwrightAgent,
        sqlAgent, elasticsearchAgent, kafkaAgent
    ];

    let passed = 0;

    for (const agent of agents) {
        process.stdout.write(`-> Testing ${agent.name}...`);
        if (!agent.description || !agent.preamble) {
            console.log(` ❌ MISSING FIELDS`); continue;
        }
        try {
            const resp = await agent.consult("Test", [{ path: 'x.txt', content: 'mock' }]);
            const content = typeof resp === 'string' ? resp : (resp?.content || '');
            if (content.includes('[MOCK_GEMINI_RESPONSE_FOR')) {
                console.log(` ✅ PASS`); passed++;
            } else {
                console.log(` ❌ FAIL`);
            }
        } catch (e) {
            console.log(` ❌ FAIL: ${e.message}`);
        }
    }

    console.log(`\n=== RESULTS: ${passed}/${agents.length} PASSED ===`);
    if (passed !== agents.length) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
