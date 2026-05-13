import { EventBus } from './src/app/shared/eventBus.js';
import { logger } from './src/shared/logger.js';
import { SentinelService } from './src/app/modules/sentinel/sentinel.service.js';

(async () => {
    // 1. Start Sentinel
    await SentinelService.startWatch();

    // 2. Connect Bus
    await EventBus.connect();

    console.log('🧪 Triggering System Error...');

    // 3. Trigger Error via Logger
    // This should go to EventBusTransport -> EventBus ('sys.log.error') -> Sentinel
    logger.error('Test Critical System Failure', { label: 'TEST-COMPONENT' });

    // 4. Wait for side effects (Sentinel logging)
    // We can't easily assert console output here programmatically without hooking stdout,
    // but we can check if Sentinel internal state changed if we exported it, 
    // or just listen for the side effect if Sentinel published something back.
    // Sentinel currently doesn't publish back, it just logs and adds to memory.

    // Let's rely on visual confirmation from logs for this step.
    console.log('✅ Error triggered. Check logs for "👁️ Sentinel detected ERROR".');

    setTimeout(() => process.exit(0), 2000);
})();
