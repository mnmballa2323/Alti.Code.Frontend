
import { graphOrchestrator } from '../src/app/modules/agents/graph.orchestrator.js';
import { logger } from '../src/app/shared/logger.js';

async function testGraph() {
    console.log("🚀 Testing GraphOrchestrator...");

    const goal = "Audit the codebase and commit changes.";

    try {
        const results = await graphOrchestrator.run(goal);

        console.log("✅ Graph Execution Complete.");
        console.log("Results:", JSON.stringify(results, null, 2));

        if (results.length > 0) {
            console.log("TEST PASSED");
        } else {
            console.log("TEST FAILED: No results");
            process.exit(1);
        }
    } catch (error) {
        console.error("TEST FAILED with error:", error);
        process.exit(1);
    }
}

testGraph();
