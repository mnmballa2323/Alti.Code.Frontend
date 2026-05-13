import { detectiveService } from '../src/app/modules/detective/detective.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';

const runVerification = async () => {
    logger.info("Starting Detective Agent Verification...");

    // Mock AI Provider
    aiProvider.reason = async (prompt) => {
        if (prompt.includes("logs")) {
            return JSON.stringify({ suspicious: true, threats: [{ type: "SSH Brute Force" }] });
        }
        return JSON.stringify({ score: 85, vulnerabilities: [] });
    };
    aiProvider.generate = async (prompt) => {
        return "Audit Summary: System is mostly secure.";
    };

    try {
        // 1. Verify SAST
        const dummyFile = 'scripts/dummy_vuln.js';
        await fs.writeFile(dummyFile, 'const query = "SELECT * FROM users WHERE id=" + req.body.id;');

        logger.info("1. Testing SAST...");
        const audit = await detectiveService.auditCodebase(dummyFile);
        logger.info("Audit Result:", audit);

        // 2. Verify Logs
        logger.info("2. Testing Log Analysis...");
        const analysis = await detectiveService.analyzeLogs("Failed password for root from 192.168.1.1");
        logger.info("Log Analysis Result:", analysis);

        await fs.unlink(dummyFile);
        logger.info("Detective Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
