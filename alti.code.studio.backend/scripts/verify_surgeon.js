import { surgeonService } from '../src/app/modules/surgeon/surgeon.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';

const runVerification = async () => {
    logger.info("Starting Surgeon Agent Verification...");

    // Mock AI Provider (Overriding existing mock if any, or real if key present)
    // Since we just added the key, we COULD test real AI, but for speed/determinism in verification we often mock.
    // However, the user gave us a key, so let's try to use it if we can, 
    // BUT the standard verify scripts in this flow have been mocking to be safe/fast.
    // Let's stick to mocking for the "Verification" step to ensure unit-test-like stability.

    aiProvider.reason = async (prompt) => {
        return JSON.stringify({
            complexity_score: 80,
            verdict: "Complex",
            simplification_plan: "Extract inner loop"
        });
    };
    aiProvider.generate = async (prompt) => {
        return `export const Singleton = { instance: null };`;
    };

    try {
        const dummyFile = 'scripts/dummy_complex.js';
        await fs.writeFile(dummyFile, 'function complex() { for(;;){ if(true){ while(true){} } } }');

        // 1. Verify Complexity Analysis
        logger.info("1. Testing Complexity Analysis...");
        const analysis = await surgeonService.analyzeComplexity(dummyFile);
        logger.info("Analysis Result:", analysis);

        // 2. Verify Refactoring
        logger.info("2. Testing Refactoring...");
        await surgeonService.applyPattern(dummyFile, "Singleton");

        const content = await fs.readFile(dummyFile, 'utf-8');
        if (!content.includes('Singleton')) throw new Error("Refactoring failed to apply");
        logger.info("✅ Refactoring applied.");

        // Cleanup
        await fs.unlink(dummyFile);
        logger.info("Surgeon Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
