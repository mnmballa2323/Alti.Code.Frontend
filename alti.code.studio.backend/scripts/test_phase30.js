
import { SynapseService } from '../src/app/modules/synapse/synapse.service.js';
import { logger } from '../src/shared/logger.js';
import { historianAgent } from '../src/app/modules/agents/historian.agent.js';
import { hiveControl } from '../src/app/modules/agents/hive.control.js';
import fs from 'fs/promises';
import path from 'path';

// Phase 30 Verify: Historian Persistence

async function runVerification() {
    logger.info("🚀 Starting Phase 30 Verification: The Historian...");

    try {
        await SynapseService.init();

        const sessionId = `test_session_${Date.now()}`;

        // 1. Manually Log Action via HiveControl
        // We cheat a bit by injecting a fake active swarm so logAction works
        hiveControl.activeSwarms.set(sessionId, { logs: [] });

        hiveControl.logAction(sessionId, 'TestAgent', 'Performed Action A');
        hiveControl.logAction(sessionId, 'TestAgent', 'Performed Action B');

        // Wait for async historian write
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2. Check Chronicle File
        const chroniclePath = path.join(process.cwd(), 'data', 'chronicle.json');
        const content = await fs.readFile(chroniclePath, 'utf8');
        const history = JSON.parse(content);

        logger.info(`📜 Current History Length: ${history.length}`);

        const recentEvents = history.filter(h => h.sessionId === sessionId);

        if (recentEvents.length < 2) {
            throw new Error(`Historian failed to record 2 events. Found: ${recentEvents.length}`);
        }

        logger.info("✅ Found recorded events:", recentEvents);

        // 3. Query Historian Agent
        const queryResult = await historianAgent.execute('queryHistory', { query: sessionId });
        if (queryResult.length !== recentEvents.length) {
            throw new Error("Historian Query mismatched file content");
        }

        logger.info("🎉 Phase 30 Verification Passed!");
        process.exit(0);

    } catch (error) {
        logger.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

runVerification();
