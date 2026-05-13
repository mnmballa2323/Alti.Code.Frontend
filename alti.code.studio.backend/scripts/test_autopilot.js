import { autopilotService } from '../src/app/modules/autopilot/autopilot.service.js';
import { logger } from '../src/shared/logger.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

// Mock Gemini AI to prevent network calls and API key checks during local testing
GeminiAiService.generateContent = async (prompt) => {
    logger.info(`  [Mock] GeminiAiService.generateContent called via Autopilot`);
    return `{"noActionNeeded": false, "reasoning": "Mocked TODO list detected actionable item.", "goal": "Analyze project architecture"}`;
};

// Mock orchestrator run to avoid actually executing a multi-minute agent chain
import { graphOrchestrator } from '../src/app/modules/agents/graph.orchestrator.js';
graphOrchestrator.run = async (goal) => {
    logger.info(`  [Mock] graphOrchestrator.run triggered for: "${goal}"`);
    await new Promise(r => setTimeout(r, 1000)); // Simulate work
    return { status: 'mock_success' };
};

async function testAutopilot() {
    logger.info("===========================================");
    logger.info("🧪 Test: Phase 5 Autopilot Heartbeat (GCP Cloud Scheduler Mock)");
    logger.info("===========================================");

    try {
        logger.info("1. Simulating first Cron trigger...");
        const result1 = await autopilotService.processHeartbeat('cron-execution-id-001');
        logger.info(`✅ First Trigger Result: ${JSON.stringify(result1)}`);

        // Wait a tiny bit (the orchestrator mock takes 1000ms)
        await new Promise(r => setTimeout(r, 100));

        logger.info("2. Simulating second Cron trigger while Orchestrator is still spinning...");
        const result2 = await autopilotService.processHeartbeat('cron-execution-id-002');
        logger.info(`✅ Second Trigger Result: ${JSON.stringify(result2)}`);

        if (result2.status === 'skipped') {
            logger.info("✅ Verification Passed: Autopilot successfully ignored overlapping cron jobs.");
        } else {
            logger.error("❌ Verification Failed: Autopilot allowed concurrent execution loops.");
            process.exit(1);
        }

        // Wait for background mock orchestrator to finish
        await new Promise(r => setTimeout(r, 1500));
        process.exit(0);

    } catch (e) {
        logger.error("❌ Autopilot Test Crashed", e);
        process.exit(1);
    }
}

testAutopilot();
