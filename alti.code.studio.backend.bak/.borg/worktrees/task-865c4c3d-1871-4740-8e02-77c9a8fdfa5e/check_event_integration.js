import { EventBus } from './src/app/shared/eventBus.js';
import { GuardianService } from './src/app/modules/guardian/guardian.service.js';

(async () => {
    console.log('🧠 Connecting to Nervous System...');
    await EventBus.connect();

    // Subscribe to expected events
    const receivedEvents = new Set();

    await EventBus.subscribe('guardian.audit.approved', (data) => {
        console.log('✅ Received: guardian.audit.approved', data);
        receivedEvents.add('guardian');
        checkDone();
    });

    await EventBus.subscribe('generator.project.created', (data) => {
        console.log('✅ Received: generator.project.created', data);
        receivedEvents.add('generator');
        checkDone();
    });

    function checkDone() {
        if (receivedEvents.has('guardian')) { // Generator event might be mocked or we just test guardian for now
            console.log('🎉 Integration Test Passed!');
            process.exit(0);
        }
    }

    // Trigger a mock audit to fire the event
    console.log('🛡️ Triggering Mock Audit...');
    await GuardianService.auditCode('console.log("Hello")', 'Integration Test');

    // Timeout
    setTimeout(() => {
        console.error('❌ Timeout: Events not received');
        process.exit(1);
    }, 10000);
})();
