/**
 * Test Harness for Tier 15: Security, Platform & Creative Agents
 */

import { pentestAgent } from '../src/app/modules/agents/pentest.agent.js';
import { githubactionsAgent } from '../src/app/modules/agents/githubactions.agent.js';
import { figmaAgent } from '../src/app/modules/agents/figma.agent.js';
import { wasmAgent } from '../src/app/modules/agents/wasm.agent.js';
import { denoAgent } from '../src/app/modules/agents/deno.agent.js';
import { mongodbAgent } from '../src/app/modules/agents/mongodb.agent.js';
import { grpcAgent } from '../src/app/modules/agents/grpc.agent.js';
import { tailwindAgent } from '../src/app/modules/agents/tailwind.agent.js';
import { i18nAgent } from '../src/app/modules/agents/i18n.agent.js';
import { websocketAgent } from '../src/app/modules/agents/websocket.agent.js';

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

GeminiAiService.generateContent = async (prompt) =>
    `[MOCK_GEMINI_RESPONSE_FOR: ${prompt.substring(0, 35)}...]`;

async function runTests() {
    console.log("=== TIER 15: SECURITY, PLATFORM & CREATIVE AGENT TESTS ===\n");

    const agents = [
        pentestAgent, githubactionsAgent, figmaAgent, wasmAgent, denoAgent,
        mongodbAgent, grpcAgent, tailwindAgent, i18nAgent, websocketAgent
    ];

    let passed = 0;
    for (const agent of agents) {
        process.stdout.write(`-> Testing ${agent.name}...`);
        if (!agent.description || !agent.preamble) { console.log(` ❌ MISSING`); continue; }
        try {
            const resp = await agent.consult("Test", [{ path: 'x.txt', content: 'mock' }]);
            const content = typeof resp === 'string' ? resp : (resp?.content || '');
            if (content.includes('[MOCK_GEMINI_RESPONSE_FOR')) { console.log(` ✅ PASS`); passed++; }
            else { console.log(` ❌ FAIL`); }
        } catch (e) { console.log(` ❌ ${e.message}`); }
    }

    console.log(`\n=== RESULTS: ${passed}/${agents.length} PASSED ===`);
    if (passed !== agents.length) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
