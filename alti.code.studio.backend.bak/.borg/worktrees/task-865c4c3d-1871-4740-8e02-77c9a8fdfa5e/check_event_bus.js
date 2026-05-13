import { EventBus } from './src/app/shared/eventBus.js';

(async () => {
    console.log('🧠 Connecting to Nervous System...');
    await EventBus.connect();

    // Subscribe
    await EventBus.subscribe('test.event', (data) => {
        console.log('✅ Received Event:', data);
        process.exit(0);
    });

    // Publish
    console.log('⚡ Publishing Test Event...');
    await EventBus.publish('test.event', { message: 'Hello World' });

    // Timeout
    setTimeout(() => {
        console.error('❌ Timeout: Event not received');
        process.exit(1);
    }, 5000);
})();
