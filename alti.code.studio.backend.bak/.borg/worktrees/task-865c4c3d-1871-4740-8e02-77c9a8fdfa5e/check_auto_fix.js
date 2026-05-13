import { EventBus } from './src/app/shared/eventBus.js';
import { logger } from './src/app/shared/logger.js';
import { Sentinel } from './src/app/modules/sentinel/sentinel.service.js';

// 1. Initialize System
logger.info('🧪 Starting Auto-Fix Verification...');

(async () => {
    try {
        // Start Sentinel
        await Sentinel.startWatch();

        // 2. Wait for stabilization
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Trigger a "Recursion" Error that the Surgeon should catch
        // We simulate an error log coming from the system
        const fakeError = {
            message: 'RangeError: Maximum call stack size exceeded (recursion detected in eventBus.js)',
            level: 'error',
            label: 'INSO Code Service',
            timestamp: new Date().toISOString()
        };

        // Publish directly to EventBus (mocking what Winston would do)
        logger.info('💥 Triggering Fake Recursion Error...');
        await EventBus.publish('sys.log.error', fakeError);

        // 4. Wait for Surgeon to react
        await new Promise(resolve => setTimeout(resolve, 3000));

        logger.info('✅ Auto-Fix Test Complete. Check logs for ⚕️ Surgeon activity.');
        process.exit(0);
    } catch (e) {
        logger.error('❌ Test Failed', e);
        process.exit(1);
    }
})();
