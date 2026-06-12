/**
 * Test Harness for Tier 13 Enterprise & Frontier Tech Agents
 */

import { stripeAgent } from '../src/app/modules/agents/stripe.agent.js';
import { redisAgent } from '../src/app/modules/agents/redis.agent.js';
import { supabaseAgent } from '../src/app/modules/agents/supabase.agent.js';
import { prismaAgent } from '../src/app/modules/agents/prisma.agent.js';
import { webrtcAgent } from '../src/app/modules/agents/webrtc.agent.js';
import { solidityAgent } from '../src/app/modules/agents/solidity.agent.js';
import { svelteAgent } from '../src/app/modules/agents/svelte.agent.js';
import { vueAgent } from '../src/app/modules/agents/vue.agent.js';
import { storybookAgent } from '../src/app/modules/agents/storybook.agent.js';
import { opentelemetryAgent } from '../src/app/modules/agents/opentelemetry.agent.js';
import { ansibleAgent } from '../src/app/modules/agents/ansible.agent.js';
import { terraformAgent } from '../src/app/modules/agents/terraform.agent.js';

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

GeminiAiService.generateContent = async (prompt) => {
    return `[MOCK_GEMINI_RESPONSE_FOR: ${prompt.substring(0, 30)}...]`;
};

async function runTests() {
    console.log("=== STARTING TIER 13 ENTERPRISE & FRONTIER AGENT TESTS ===\n");

    const agents = [
        stripeAgent, redisAgent, supabaseAgent, prismaAgent,
        webrtcAgent, solidityAgent, svelteAgent, vueAgent,
        storybookAgent, opentelemetryAgent, ansibleAgent, terraformAgent
    ];

    let passed = 0;

    for (const agent of agents) {
        process.stdout.write(`-> Testing ${agent.name}...`);

        if (!agent.description || !agent.preamble) {
            console.log(` ❌ MISSING FIELDS`);
            continue;
        }

        try {
            const resp = await agent.consult("Test prompt", [{ path: 'test.txt', content: 'mock' }]);
            const content = typeof resp === 'string' ? resp : (resp?.content || '');
            if (content.includes('[MOCK_GEMINI_RESPONSE_FOR')) {
                console.log(` ✅ PASS`);
                passed++;
            } else {
                console.log(` ❌ FAIL (bad response)`);
            }
        } catch (e) {
            console.log(` ❌ FAIL: ${e.message}`);
        }
    }

    console.log(`\n=== RESULTS: ${passed}/${agents.length} PASSED ===`);
    if (passed !== agents.length) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
