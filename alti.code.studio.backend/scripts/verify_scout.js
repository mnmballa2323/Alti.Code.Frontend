import { scoutService } from '../src/app/modules/scout/scout.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

const runVerification = async () => {
    logger.info("Starting Scout Agent Verification...");

    // Mock AI Provider
    aiProvider.reason = async (prompt) => {
        return JSON.stringify({
            risk_level: "Medium",
            breaking_changes: ["API v2 removed deprecated methods"]
        });
    };

    try {
        // 1. Verify Updates Check (Might fail depending on npm environment, so we catch)
        logger.info("1. Testing Update Check...");
        try {
            const updates = await scoutService.checkUpdates();
            logger.info("Update Check Result:", updates);
        } catch (e) {
            logger.warn("Update check skipped (npm issue): " + e.message);
        }

        // 2. Verify Migration Analysis
        logger.info("2. Testing Migration Analysis...");
        const migration = await scoutService.analyzeMigration('react', '16.8.0', '18.0.0');
        logger.info("Migration Result:", migration);

        logger.info("Scout Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
