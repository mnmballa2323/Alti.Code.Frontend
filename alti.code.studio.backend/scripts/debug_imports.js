
try {
    console.log('Importing logger...');
    const { logger } = await import('../src/shared/logger.js');
    console.log('Logger imported successfully');
    logger.info('Test log');
} catch (e) {
    console.error('Import failed:', e);
}
