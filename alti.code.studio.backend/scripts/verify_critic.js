import { criticService } from '../src/app/modules/critic/critic.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';

const runVerification = async () => {
    logger.info("Starting Critic Agent Verification...");

    // Mock AI Provider (since env key is missing)
    aiProvider.generate = async (prompt) => {
        logger.info("Mock AI: Generating Test Code...");
        return `
        describe('Math Test', () => {
            test('adds 1 + 2 to equal 3', () => {
                expect(1 + 2).toBe(3);
            });
        });
        `;
    };

    try {
        // 1. Generate Test (Simulated on a dummy file)
        const dummyFile = 'scripts/dummy_math.js';
        await fs.writeFile(dummyFile, 'export const add = (a,b) => a+b;');

        logger.info("1. Testing Test Generation...");
        const genResult = await criticService.generateTest(dummyFile);
        logger.info("Generation Result:", genResult);

        // 2. Run Test
        logger.info("2. Testing Test Execution...");
        const runResult = await criticService.runTests(genResult.testFilePath);
        logger.info("Execution Result:", runResult);

        // Cleanup
        await fs.unlink(dummyFile);
        await fs.unlink(genResult.testFilePath);

        logger.info("Critic Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
