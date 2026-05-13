import { DirectorService } from '../src/app/modules/director/director.service.js';
import { StrategistService } from '../src/app/modules/strategist/strategist.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

// Mock AI Provider
aiProvider.reason = async (prompt) => {
    logger.info("🤖 AI Mock: Reasoning...");
    if (prompt.includes('Director')) {
        return JSON.stringify([
            { agent: 'The Architect', task: 'Setup Docker container' },
            { agent: 'The Composer', task: 'Write index.js' }
        ]);
    }
    return "MOCK_RESPONSE";
};

const runVerification = async () => {
    logger.info("Starting Executive Agent Verification...");

    try {
        // 1. Verify Strategist Optimization
        logger.info("1. Testing Strategist Optimization...");
        const plan = { tasks: [{ id: 1, agent: 'A' }, { id: 2, agent: 'B' }] };
        const optimized = await StrategistService.optimize(plan);
        logger.info("Optimization Result:", optimized);
        if (!optimized.optimized) throw new Error("Strategist failed to optimize");

        // 2. Verify Strategist Analysis
        logger.info("2. Testing Strategist Analysis...");
        const analysis = await StrategistService.analyze();
        logger.info("Analysis Result:", analysis);
        if (!analysis.overallSuccess) throw new Error("Strategist failed to analyze");

        // 3. Verify Director Mission Start
        logger.info("3. Testing Director Mission Start...");
        const missionResult = await DirectorService.startMission("Build a Hello World App");
        logger.info("Mission Start Result:", missionResult);
        if (missionResult.status !== 'started') throw new Error("Director failed to start mission");

        // 4. Verify Mission Status
        logger.info("4. Testing Mission Status...");
        const status = await DirectorService.getMissionStatus(missionResult.missionId);
        logger.info("Mission Status:", status);
        // Status might be ready, running, or completed depending on async timing.
        if (status.status === 'not-found') throw new Error("Mission not found");

        logger.info("Executive Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
