/**
 * Test Harness for Tier 12 Hyper-Niche Specialist Agents
 */

import { regexAgent } from '../src/app/modules/agents/regex.agent.js';
import { dockerAgent } from '../src/app/modules/agents/docker.agent.js';
import { kubernetesAgent } from '../src/app/modules/agents/kubernetes.agent.js';
import { nginxAgent } from '../src/app/modules/agents/nginx.agent.js';
import { graphqlAgent } from '../src/app/modules/agents/graphql.agent.js';
import { bashAgent } from '../src/app/modules/agents/bash.agent.js';
import { cronAgent } from '../src/app/modules/agents/cron.agent.js';
import { ffmpegAgent } from '../src/app/modules/agents/ffmpeg.agent.js';
import { jwtAgent } from '../src/app/modules/agents/jwt.agent.js';
import { threejsAgent } from '../src/app/modules/agents/threejs.agent.js';

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

// Mock the Gemini service to bypass actual network API calls during unit testing
GeminiAiService.generateContent = async (prompt) => {
    return `[MOCK_GEMINI_RESPONSE_FOR: ${prompt.substring(0, 30)}...]`;
};

async function runTests() {
    console.log("=== STARTING TIER 12 NICHE AGENT TESTS ===\n");

    const agents = [
        regexAgent, dockerAgent, kubernetesAgent, nginxAgent, graphqlAgent,
        bashAgent, cronAgent, ffmpegAgent, jwtAgent, threejsAgent
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
            const resp = await agent.consult("Run a quick test", [{ path: 'test.txt', content: 'mock content' }]);
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
