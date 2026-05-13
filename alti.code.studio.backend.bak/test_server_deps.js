
(async () => {
    try {
        console.log('1. Importing config...');
        await import('./config/index.js');

        console.log('1a. Importing mongoose...');
        await import('mongoose');

        console.log('2. Importing logger...');
        await import('./src/shared/logger.js');

        // Check modules explicitly before app
        console.log('2a. Importing cacheService...');
        await import('./src/app/modules/cache/cache.service.js');

        console.log('3. Importing app...');
        await import('./index.js');

        console.log('--- Dependencies OK ---');
    } catch (e) {
        console.error('❌ Failed step:', e);
    }
})();
