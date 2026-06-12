/**
 * Test Harness for Tier 16: Extended Cloud Provider Agents
 */

import { cloudflareAgent } from '../src/app/modules/agents/cloudflare.agent.js';
import { vercelAgent } from '../src/app/modules/agents/vercel.agent.js';
import { netlifyAgent } from '../src/app/modules/agents/netlify.agent.js';
import { digitaloceanAgent } from '../src/app/modules/agents/digitalocean.agent.js';
import { oracleAgent } from '../src/app/modules/agents/oracle.agent.js';
import { ibmcloudAgent } from '../src/app/modules/agents/ibmcloud.agent.js';
import { alibabaAgent } from '../src/app/modules/agents/alibaba.agent.js';
import { hetznerAgent } from '../src/app/modules/agents/hetzner.agent.js';
import { flyioAgent } from '../src/app/modules/agents/flyio.agent.js';
import { railwayAgent } from '../src/app/modules/agents/railway.agent.js';

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

GeminiAiService.generateContent = async (prompt) =>
    `[MOCK_GEMINI_RESPONSE_FOR: ${prompt.substring(0, 35)}...]`;

async function runTests() {
    console.log("=== TIER 16: EXTENDED CLOUD PROVIDER AGENT TESTS ===\n");

    const agents = [
        cloudflareAgent, vercelAgent, netlifyAgent, digitaloceanAgent, oracleAgent,
        ibmcloudAgent, alibabaAgent, hetznerAgent, flyioAgent, railwayAgent
    ];

    let passed = 0;
    for (const agent of agents) {
        process.stdout.write(`-> Testing ${agent.name}...`);
        if (!agent.description || !agent.preamble) { console.log(' ❌ MISSING'); continue; }
        try {
            const resp = await agent.consult("Deploy a microservice", [{ path: 'Dockerfile', content: 'FROM node:20-alpine' }]);
            const content = typeof resp === 'string' ? resp : (resp?.content || '');
            if (content.includes('[MOCK_GEMINI_RESPONSE_FOR')) { console.log(' ✅ PASS'); passed++; }
            else { console.log(' ❌ FAIL'); }
        } catch (e) { console.log(` ❌ ${e.message}`); }
    }

    console.log(`\n=== RESULTS: ${passed}/${agents.length} PASSED ===`);
    if (passed !== agents.length) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
