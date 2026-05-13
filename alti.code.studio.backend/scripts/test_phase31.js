
import { SynapseService } from '../src/app/modules/synapse/synapse.service.js';
import { logger } from '../src/shared/logger.js';
import { analystAgent } from '../src/app/modules/agents/analyst.agent.js';
import { historianAgent } from '../src/app/modules/agents/historian.agent.js';

// Phase 31 Verify: Analyst Reporting

async function runVerification() {
    logger.info("🚀 Starting Phase 31 Verification: The Analyst...");

    try {
        await SynapseService.init();

        // 1. Seed Historian with some data if empty
        const history = await historianAgent.getChronicle();
        if (history.length < 5) {
            logger.info("ℹ️ Seeding Historian with mock data...");
            await historianAgent.recordEvent('seed_1', 'MockAgent', 'Action 1');
            await historianAgent.recordEvent('seed_2', 'MockAgent', 'Action 2');
            await historianAgent.recordEvent('seed_3', 'ErrorAgent', 'Fail', { error: 'MockError' });
        }

        // 2. Request Report
        logger.info("📊 Requesting Performance Report...");
        const report = await analystAgent.execute('generateReport', { type: 'performance' });

        logger.info("✅ Report Received:", JSON.stringify(report, null, 2));

        if (!report.stats || !report.generatedAt) {
            throw new Error("Report structure invalid");
        }

        if (report.stats.totalEvents === 0) {
            throw new Error("Report shows 0 events despite seeding");
        }

        // 3. Request Trends
        logger.info("📈 Requesting Trends...");
        const trends = await analystAgent.execute('analyzeTrends', { metric: 'agent_activity' });
        logger.info("✅ Trends Received:", JSON.stringify(trends, null, 2));

        if (!trends.data) throw new Error("Trends data missing");

        logger.info("🎉 Phase 31 Verification Passed!");
        process.exit(0);

    } catch (error) {
        logger.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

runVerification();
