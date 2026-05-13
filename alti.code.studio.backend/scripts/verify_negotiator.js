import { negotiatorService } from '../src/app/modules/negotiator/negotiator.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';
import path from 'path';

const runVerification = async () => {
    logger.info("Starting Negotiator Agent Verification...");

    // Mock AI Provider
    aiProvider.generate = async (prompt) => {
        return `
        export const Service = {
            create: async (data) => { return { id: 1, ...data }; }
        };
        `;
    };

    try {
        const testService = 'test_integration';
        const testPath = path.resolve(`src/app/modules/integrations/${testService}/${testService}.service.js`);

        // 1. Verify Scaffold
        logger.info("1. Testing Scaffold...");
        await negotiatorService.scaffoldIntegration(testService, "A test service");

        const fileExists = await fs.access(testPath).then(() => true).catch(() => false);
        if (!fileExists) throw new Error("Service file not created");
        logger.info("✅ Service file created.");

        // 2. Verify Mock
        logger.info("2. Testing Mock Gen...");
        await negotiatorService.generateMock(testService);

        // Cleanup
        await fs.rm(path.dirname(testPath), { recursive: true, force: true });
        logger.info("Negotiator Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
