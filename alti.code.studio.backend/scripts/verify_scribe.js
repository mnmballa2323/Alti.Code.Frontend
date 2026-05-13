import { ScribeService } from '../src/app/modules/scribe/scribe.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';
import path from 'path';

const runVerification = async () => {
    logger.info("Starting Scribe Agent Verification...");

    // Mock AI Provider
    aiProvider.generate = async (prompt) => {
        if (prompt.includes('JSDoc')) return '/** Doc */\nfunction test(){}';
        if (prompt.includes('Wiki')) return '# API Auth\nDetails here.';
        return '';
    };

    try {
        // 1. Verify Document Code
        logger.info("1. Testing Auto-Docs...");
        const docResult = await ScribeService.documentCode('function test(){}', 'test.js');
        logger.info("Doc Result:", docResult);
        if (!docResult.code.includes('/** Doc */')) throw new Error("Docs not added");

        // 2. Verify Wiki Update
        logger.info("2. Testing Wiki Gen...");
        const topic = "Integration Test";
        const wikiResult = await ScribeService.updateWiki(topic, "We added new tests.");
        logger.info("Wiki Result:", wikiResult);

        // Check file existence
        const wikiPath = path.resolve('docs/wiki/integration-test.md');
        await fs.access(wikiPath);
        logger.info("✅ Wiki file created.");

        // Cleanup
        await fs.rm(path.resolve('docs/wiki'), { recursive: true, force: true });

        logger.info("Scribe Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
