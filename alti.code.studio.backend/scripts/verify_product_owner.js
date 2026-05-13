import { productOwnerService } from '../src/app/modules/productOwner/productOwner.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

const runVerification = async () => {
    logger.info("Starting Product Owner Verification...");

    // Mock AI Provider for verification because GEMINI_API_KEY is missing in env
    // In a real environment with keys, we would call await aiProvider.init();

    // Mocking the 'reason' method used by analyzeRequest
    aiProvider.reason = async (prompt) => {
        logger.info("Mock AI Provider: 'reason' called with prompt length " + prompt.length);
        return JSON.stringify({
            alignment_score: 9,
            alignment_reasoning: "Matches the vision perfectly.",
            suggested_features: [
                { name: "Context Awareness", description: "Use VISION.md", priority: "High" }
            ]
        });
    };

    // Mocking the 'generate' method used by generateUserStories
    aiProvider.generate = async (prompt) => {
        logger.info("Mock AI Provider: 'generate' called with prompt length " + prompt.length);
        return JSON.stringify([
            { title: "As a Product Owner, I want context awareness, so that I can align with vision.", acceptance_criteria: ["Reads VISION.md"], estimation_points: 3 }
        ]);
    };

    try {
        const analysis = await productOwnerService.analyze("Make this platform better than cursor or copilot");
        logger.info("Analysis Result:");
        console.dir(analysis, { depth: null });

        if (analysis.suggested_features && analysis.suggested_features.length > 0) {
            const firstFeature = analysis.suggested_features[0];
            logger.info(`Generating stories for feature: ${firstFeature.name}`);

            const stories = await productOwnerService.createStories(firstFeature.name, firstFeature.description);
            logger.info("Stories Result:");
            console.dir(stories, { depth: null });
        }

        logger.info("Product Owner Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
