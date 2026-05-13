
console.log('1. Starting minimal test in bin...');

try {
    console.log('2. Importing Surgeon...');
    const { Surgeon } = await import('../src/app/modules/surgeon/surgeon.service.js');
    console.log('3. Surgeon Imported:', !!Surgeon);

    console.log('4. Importing Redis...');
    const { redisClient } = await import('../src/shared/redis.client.js');
    console.log('5. Redis Imported:', !!redisClient);

    console.log('6. Importing Postgres...');
    const { postgresClient } = await import('../src/app/shared/postgres.client.js');
    console.log('7. Postgres Imported:', !!postgresClient);

} catch (error) {
    console.error('CRITICAL IMPORT ERROR:', error);
}

console.log('8. Test Complete');
