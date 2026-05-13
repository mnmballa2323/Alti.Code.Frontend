import { oracleService } from '../src/app/modules/oracle/oracle.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';

const runVerification = async () => {
    logger.info("Starting Oracle Agent Verification...");

    // Mock AI Provider
    aiProvider.reason = async (prompt) => {
        if (prompt.includes("SQL")) {
            return JSON.stringify({ rating: 5, suggested_indexes: ["CREATE INDEX idx_user_id ON orders(user_id)"] });
        }
        return JSON.stringify({ n_plus_one_found: true, fix_suggestion: "Use mongoose .populate()" });
    };

    try {
        // 1. Verify Query Analysis
        logger.info("1. Testing Query Analysis...");
        const analysis = await oracleService.analyzeQuery("SELECT * FROM orders WHERE user_id = 5");
        logger.info("Analysis Result:", analysis);

        // 2. Verify N+1 Detection
        const dummyFile = 'scripts/dummy_n1.js';
        await fs.writeFile(dummyFile, 'users.forEach(u => db.find(posts, u.id));');

        logger.info("2. Testing N+1 Detection...");
        const scan = await oracleService.detectNPlusOne(dummyFile);
        logger.info("Scan Result:", scan);

        await fs.unlink(dummyFile);
        logger.info("Oracle Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
