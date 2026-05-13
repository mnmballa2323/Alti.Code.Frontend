import { diplomatService } from '../src/app/modules/diplomat/diplomat.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';
import path from 'path';

const runVerification = async () => {
    logger.info("Starting Diplomat Agent Verification...");

    // Mock AI Provider
    aiProvider.reason = async (prompt) => {
        return JSON.stringify({
            extracted: [{ string: "Hello World", suggestedKey: "GREETING", context: "Test" }]
        });
    };
    aiProvider.generate = async (prompt) => {
        return JSON.stringify({
            "GREETING_HELLO": "Hola Mundo"
        });
    };

    try {
        // 1. Verify Extraction
        const dummyFile = 'scripts/dummy_ui.js';
        await fs.writeFile(dummyFile, 'const x = "Hello World";');

        logger.info("1. Testing Extraction...");
        const extraction = await diplomatService.extractStrings(dummyFile);
        logger.info("Extraction Result:", extraction);

        // 2. Verify Translation
        logger.info("2. Testing Translation...");
        const translation = await diplomatService.translate('es', { "GREETING_HELLO": "Hello World" });
        logger.info("Translation Result:", translation);

        // Check if file created
        const localeFile = path.resolve('src/locales/es.json');
        const fileExists = await fs.access(localeFile).then(() => true).catch(() => false);

        if (fileExists) {
            logger.info("✅ Locale file created.");
            // Cleanup
            await fs.unlink(localeFile);
            await fs.rmdir(path.resolve('src/locales')).catch(() => { });
        } else {
            throw new Error("Locale file not created.");
        }

        await fs.unlink(dummyFile);
        logger.info("Diplomat Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
