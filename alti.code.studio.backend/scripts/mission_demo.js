
import { graphOrchestrator } from '../src/app/modules/agents/graph.orchestrator.js';
import { logger } from '../src/shared/logger.js';
import { sirenAgent } from '../src/app/modules/agents/siren.agent.js';

async function runDemo() {
    console.log("🚀 Starting Grand Unification Mission Demo...");

    // Announce start
    // await sirenAgent.speak("Initializing Grand Unification Mission.");

    const goal = "Go to https://example.com, read the content, save the title to memory with metadata {source: 'example.com'}, and then announced 'Mission Complete' via voice.";

    console.log(`🎯 Goal: ${goal}`);

    try {
        const results = await graphOrchestrator.run(goal);
        console.log("✅ Mission Execution Finished.");
        console.log("Results:", JSON.stringify(results, null, 2));

        // await sirenAgent.speak("Demonstration concluded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Mission Failed:", error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

runDemo();
