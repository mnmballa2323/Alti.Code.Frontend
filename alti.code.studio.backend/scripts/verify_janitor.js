import { janitorService } from '../src/app/modules/janitor/janitor.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';

const runVerification = async () => {
    logger.info("Starting Janitor Agent Verification...");

    // Mock AI Provider
    aiProvider.reason = async (prompt) => {
        return JSON.stringify({
            unused_imports: ['lodash'],
            cleaned_code: 'export const run = () => { console.log("Cleaned"); };'
        });
    };

    try {
        const dummyFile = 'scripts/dummy_mess.js';
        await fs.writeFile(dummyFile, `import _ from 'lodash';\n// TODO: Fix this\nexport const run = () => { console.log("Cleaned"); };`);

        // 1. Verify Sweep
        logger.info("1. Testing Sweep...");
        const sweep = await janitorService.sweepCode(dummyFile);
        logger.info("Sweep Result:", sweep);

        // 2. Verify TODOs
        logger.info("2. Testing TODO detection...");
        const todos = await janitorService.aggregateTodos(dummyFile);
        logger.info("TODOs:", todos);

        if (todos.todos.length !== 1) throw new Error("Failed to find TODO");

        // Cleanup
        await fs.unlink(dummyFile);
        logger.info("Janitor Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
