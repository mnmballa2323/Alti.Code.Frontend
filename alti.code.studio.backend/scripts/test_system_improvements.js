/**
 * System Improvement Integration Test
 * Validates: CapabilityRouter, SwarmHealthMonitor, AgentCapabilityIndex
 */

import { capabilityRouter } from '../src/app/modules/agents/capability.router.js';
import { swarmHealthMonitor } from '../src/app/modules/agents/swarm.health.js';
import { agentIndex } from '../src/app/modules/agents/agent.index.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

// Mock Gemini
GeminiAiService.generateContent = async (p) => `[MOCK: ${p.substring(0, 30)}...]`;

let passed = 0;
let total = 0;

function test(name, fn) {
    total++;
    try {
        const result = fn();
        if (result === true || result === undefined) {
            console.log(`  ✅ ${name}`);
            passed++;
        } else {
            console.log(`  ❌ ${name} → returned: ${result}`);
        }
    } catch (e) {
        console.log(`  ❌ ${name} → threw: ${e.message}`);
    }
}

async function testAsync(name, fn) {
    total++;
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (e) {
        console.log(`  ❌ ${name} → ${e.message}`);
    }
}

console.log("\n=== SYSTEM IMPROVEMENT INTEGRATION TEST ===\n");

// ── CapabilityRouter ──────────────────────────────────────────────────────────
console.log("📍 CapabilityRouter");
test("loads with 60+ routes", () => capabilityRouter.table.length >= 60);
test("routes 'stripe payment webhook' → Stripe_Expert", () => {
    const match = capabilityRouter.route('stripe payment webhook processing');
    return match?.name === 'Stripe_Expert';
});
test("routes 'sql window function cte' → SQL_Expert", () => {
    const match = capabilityRouter.route('sql cte window function query plan');
    return match?.name === 'SQL_Expert';
});
test("routes 'kubernetes helm ingress' → Kubernetes_Expert", () => {
    const match = capabilityRouter.route('deploy kubernetes helm ingress pod');
    return match?.name === 'Kubernetes_Expert';
});
test("routes 'cloudflare workers durable objects' → Cloudflare_Expert", () => {
    const match = capabilityRouter.route('cloudflare workers durable objects d1');
    return match?.name === 'Cloudflare_Expert';
});
test("returns null for unmatchable query", () => {
    const match = capabilityRouter.route('zxqwerty absolutely unmatched nonsense query');
    return match === null;
});
test("routeTop returns N results", () => {
    const top = capabilityRouter.routeTop('react native flutter mobile', 3);
    return top.length >= 1 && top.length <= 3;
});
test("getManifest returns non-empty string", () => {
    const m = capabilityRouter.getManifest();
    return typeof m === 'string' && m.length > 100;
});

// ── AgentCapabilityIndex ──────────────────────────────────────────────────────
console.log("\n📍 AgentCapabilityIndex");
test("indexes 60+ agents", () => agentIndex.entries.length >= 60);
test("search('stripe') returns results", () => {
    const r = agentIndex.search('stripe');
    return r.length > 0 && r[0].name.includes('Stripe');
});
test("stats() reports correct totals", () => {
    const s = agentIndex.stats();
    return s.totalAgents >= 60 && s.avgKeywordsPerAgent > 3;
});
test("get() finds agent by name", () => {
    const entry = agentIndex.get('Kafka_Expert');
    return entry !== null && entry.name === 'Kafka_Expert';
});
test("list() returns all agents", () => agentIndex.list().length >= 60);
test("list('cloud') filters to cloud agents", () => {
    const r = agentIndex.list('cloud');
    return r.length > 0;
});

// ── SwarmHealthMonitor ────────────────────────────────────────────────────────
console.log("\n📍 SwarmHealthMonitor");
await testAsync("sweep() executes without throwing", async () => {
    await swarmHealthMonitor.sweep();
});
test("getReport() returns summary with totalAgents", () => {
    const r = swarmHealthMonitor.getReport();
    return r.summary.total >= 60;
});
test("all swept agents show healthy status", () => {
    const r = swarmHealthMonitor.getReport();
    return r.summary.healthy >= 60 && r.summary.degraded === 0;
});
test("uptime shows 100%", () => {
    const r = swarmHealthMonitor.getReport();
    return r.summary.uptime === '100.0%';
});

// ── Dispatch ──────────────────────────────────────────────────────────────────
console.log("\n📍 Dispatch Integration");
await testAsync("dispatch('kafka exactly once consumer group') returns result", async () => {
    const result = await capabilityRouter.dispatch('kafka exactly once consumer group', []);
    if (!result) throw new Error('No result returned');
});
await testAsync("fanOut returns multiple results", async () => {
    const results = await capabilityRouter.fanOut('terraform hcl module deploy', [], 2);
    if (results.length === 0) throw new Error('No fan-out results');
});

console.log(`\n=== RESULTS: ${passed}/${total} PASSED ===\n`);
if (passed !== total) process.exit(1);
