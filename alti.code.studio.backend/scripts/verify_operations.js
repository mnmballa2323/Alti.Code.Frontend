import { CaptainService } from '../src/app/modules/captain/captain.service.js';
import { NavigatorService } from '../src/app/modules/navigator/navigator.service.js';
import { logger } from '../src/shared/logger.js';

const runVerification = async () => {
    logger.info("Starting Operations Agent Verification...");

    try {
        // 1. Verify Captain Health Check
        logger.info("1. Testing Captain Health Check...");
        const health = await CaptainService.checkHealth();
        logger.info("Health Result:", health);
        if (health.status !== 'nominal' && health.status !== 'warning') throw new Error("Captain failed health check");

        // 2. Verify Captain Emergency
        logger.info("2. Testing Captain Emergency Protocol...");
        const emergency = await CaptainService.declareEmergency('critical', 'Simulation Test');
        logger.info("Emergency Result:", emergency);
        if (emergency.status !== 'critical') throw new Error("Captain failed emergency declaration");

        // 3. Verify Navigator Scaling (Scale Up)
        logger.info("3. Testing Navigator Scale Up...");
        const scaleUp = await NavigatorService.scale(90);
        logger.info("Scale Up Result:", scaleUp);
        if (scaleUp.decision !== 'scale-up' || scaleUp.currentNodes !== 4) throw new Error("Navigator failed to scale up");

        // 4. Verify Navigator Scaling (Scale Down)
        logger.info("4. Testing Navigator Scale Down...");
        const scaleDown = await NavigatorService.scale(10);
        logger.info("Scale Down Result:", scaleDown);
        if (scaleDown.decision !== 'scale-down' || scaleDown.currentNodes !== 3) throw new Error("Navigator failed to scale down");

        // 5. Verify Navigator Cost Optimization
        logger.info("5. Testing Navigator Optimization...");
        const optimization = await NavigatorService.optimize();
        logger.info("Optimization Result:", optimization);
        if (optimization.status !== 'optimized') throw new Error("Navigator failed optimization");

        logger.info("Operations Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
