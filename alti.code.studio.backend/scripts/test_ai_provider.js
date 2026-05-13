import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import { logger } from '../src/shared/logger.js';

const run = async () => {
    logger.info("Testing AI Provider Init...");
    logger.info(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);

    try {
        await aiProvider.init();
        logger.info("AI Provider Init Success");

        const info = aiProvider.getInfo();
        logger.info("Provider Info:", info);

        logger.info("Testing Generation...");
        const response = await aiProvider.reason("Say hello");
        logger.info("AI Response:", response);

    } catch (error) {
        logger.error("AI Provider Init Failed", error);
    }
};

run();
