import { SentinelService } from '../src/app/modules/sentinel/sentinel.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import { surgeonService } from '../src/app/modules/surgeon/surgeon.service.js';

const runVerification = async () => {
    logger.info("Starting Sentinel Agent Verification...");

    // Mock AI & Surgeon
    aiProvider.reason = async (prompt) => {
        return JSON.stringify({
            rootCause: "Syntax Error",
            filePath: "src/broken.js",
            isFixable: true,
            suggestedFix: "Add semicolon"
        });
    };

    // Mock Surgeon to avoid actual file edits during this test
    surgeonService.applyPattern = async (file, pattern, context) => {
        return { status: 'success', file, message: 'Mock surgery performed' };
    };

    try {
        // 1. Verify Watch Start
        logger.info("1. Testing Watch Start...");
        const watch = await SentinelService.startWatch();
        logger.info("Watch Status:", watch);

        // 2. Verify Scan
        logger.info("2. Testing System Scan...");
        const scan = await SentinelService.scanSystem();
        logger.info("Scan Result:", scan);

        // 3. Verify Error Analysis & Auto-Remediation Trigger
        logger.info("3. Testing Error Handling...");
        const diagnosis = await SentinelService.analyzeError({
            message: "ReferenceError: x is not defined",
            stack: "at src/broken.js:10:5"
        });
        logger.info("Diagnosis:", diagnosis);

        if (diagnosis.remediation !== 'attempted') {
            throw new Error("Sentinel failed to attempt remediation on fixable error");
        }

        logger.info("Sentinel Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
