import { RecruiterService } from '../src/app/modules/recruiter/recruiter.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

const runVerification = async () => {
    logger.info("Starting Recruiter Agent Verification...");

    // Mock AI Provider
    aiProvider.generate = async (prompt) => {
        return "Welcome to the team! logic...";
    };
    aiProvider.reason = async (prompt) => {
        return JSON.stringify({ weekGoal: "Master Node.js", schedule: [{ day: 1, topic: "Setup", tasks: ["Install Node"] }] });
    };

    try {
        // 1. Verify Onboarding
        logger.info("1. Testing Onboarding...");
        const onboard = await RecruiterService.onboardUser('dev@example.com', 'Senior Dev');
        logger.info("Onboard Result:", onboard);
        if (onboard.status !== 'onboarded') throw new Error("Onboarding failed");

        // 2. Verify Training Plan
        logger.info("2. Testing Training Plan...");
        const plan = await RecruiterService.generateTrainingPlan('Junior', 'Node.js');
        logger.info("Plan Result:", plan);
        if (!plan.weekGoal) throw new Error("Plan generation failed");

        logger.info("Recruiter Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
