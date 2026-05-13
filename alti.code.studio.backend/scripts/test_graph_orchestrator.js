
import { graphOrchestrator } from '../src/app/modules/agents/graph.orchestrator.js';
import { logger } from '../src/shared/logger.js';


async function testGraph() {
    const startTime = Date.now();
    console.log('🚀 Testing GraphOrchestrator...\n');

    const goal = 'Scan the codebase for security vulnerabilities and summarize findings.';
    console.log(`Goal: "${goal}"\n`);

    let results;
    try {
        results = await graphOrchestrator.run(goal);
    } catch (error) {
        console.error('❌ TEST FAILED — graphOrchestrator.run() threw:', error);
        process.exit(1);
    }

    // ── Assertion helpers ──────────────────────────────────────────────────
    let passed = 0;
    let failed = 0;

    function assert(condition, label) {
        if (condition) {
            console.log(`  ✅ ${label}`);
            passed++;
        } else {
            console.error(`  ❌ ${label}`);
            failed++;
        }
    }

    console.log('Assertions:');

    // 1. At least one output was produced
    assert(Array.isArray(results) && results.length > 0, `Graph produced outputs (got ${results?.length ?? 0})`);

    // 2. At least one output contains a 'planning' node result
    const hasPlanning = results.some(r => Object.keys(r).includes('planning'));
    assert(hasPlanning, 'Graph passed through the planning node');

    // 3. The final state should not have an unhandled error
    const lastOutput = results[results.length - 1] ?? {};
    const finalState = Object.values(lastOutput)[0] ?? {};
    assert(
        finalState.error === null || finalState.error === undefined,
        `Final state has no unresolved error (error=${JSON.stringify(finalState.error)})`
    );

    // 4. Results array exists on the final state (execution produced something)
    assert(
        Array.isArray(finalState.results),
        `Final state contains a results array (length=${finalState.results?.length ?? 'N/A'})`
    );

    // 5. No individual step result prefixed with "❌" indicating full failure
    const stepResults = finalState.results ?? [];
    const hardFailures = stepResults.filter(r => typeof r === 'string' && r.startsWith('❌ FAILED'));
    assert(hardFailures.length === 0, `No hard-failed steps (${hardFailures.length} found)`);

    // ── Summary ───────────────────────────────────────────────────────────
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n--- Results: ${passed} passed, ${failed} failed | Duration: ${duration}s ---\n`);

    if (failed > 0) {
        console.error('GRAPH TEST FAILED');
        process.exit(1);
    }

    console.log('GRAPH TEST PASSED 🎉');
    process.exit(0);
}

testGraph();
