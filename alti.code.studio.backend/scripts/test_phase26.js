
import { hiveControl } from '../src/app/modules/agents/hive.control.js';
import { logger } from '../src/shared/logger.js';
import { SynapseService } from '../src/app/modules/synapse/synapse.service.js';
import fs from 'fs';
import path from 'path';

async function runVerification() {
    logger.info("🚀 Starting Phase 26 Verification: The Hive Mind...");

    try {
        // Initialize Synapse (Mock Mode)
        await SynapseService.init();

        const goal = "Create a secure login feature";
        const requiredRoles = ['planning', 'design', 'review', 'scaffold', 'collaboration'];

        // Start Collaborative Session
        logger.info("🕸️ requesting Collaborative Session from HiveControl...");
        const session = await hiveControl.startSession(goal, requiredRoles);

        logger.info("✅ Session Result:", session);

        // Verify Session Memory populated
        const plan = await SynapseService.getMemory(session.id, 'plan');
        const design = await SynapseService.getMemory(session.id, 'design');
        const build = await SynapseService.getMemory(session.id, 'build_result');

        if (!plan) throw new Error("❌ Session Memory missing 'plan'");
        if (!design) throw new Error("❌ Session Memory missing 'design'");
        if (!build) throw new Error("❌ Session Memory missing 'build_result'");

        logger.info("🧠 Hive Mind Memory Verified:");
        logger.info("  - Plan:", plan.steps ? "Present" : "Missing");
        logger.info("  - Design:", design.feature);
        logger.info("  - Build:", build.length + " files created");

        // Cleanup
        for (const msg of build) {
            if (msg.startsWith('✅ CREATED')) {
                const filePath = msg.replace('✅ CREATED ', '');
                const fullPath = path.resolve(process.cwd(), filePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    logger.info(`🧹 Cleaned up: ${filePath}`);
                    // Try removing dir
                    try { fs.rmdirSync(path.dirname(fullPath)); } catch (e) { }
                }
            }
        }

        logger.info("🎉 Phase 26 Verification Passed!");

    } catch (error) {
        logger.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

runVerification();
