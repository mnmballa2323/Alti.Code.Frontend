import { SimulatorService } from '../src/app/modules/shadowWorkspace/sandbox.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

const runVerification = async () => {
    logger.info("Starting Simulator Agent Verification...");

    // Mock AI Provider (for safety check)
    aiProvider.reason = async (prompt) => {
        return JSON.stringify({ safe: true, reason: 'Looks clean' });
    };

    try {
        // 1. Verify Sandbox Execution
        logger.info("1. Testing Sandbox Confine...");
        const code = "1 + 1;";
        const result = await SimulatorService.execute(code);
        logger.info("Sandbox Result:", result);
        if (result.result !== 2) throw new Error("Sandbox math failed");

        // 2. Verify Chaos Injection
        logger.info("2. Testing Chaos Injection...");
        const chaos = await SimulatorService.injectChaos("AuthService", "latency");
        logger.info("Chaos Status:", chaos);

        // 3. Verify Load Test
        logger.info("3. Testing Load Simulation...");
        const load = await SimulatorService.loadTest("/api/v1/users", 500);
        logger.info("Load Test Results:", load);

        logger.info("Simulator Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        console.error(error);
        process.exit(1);
    }
};

runVerification();
