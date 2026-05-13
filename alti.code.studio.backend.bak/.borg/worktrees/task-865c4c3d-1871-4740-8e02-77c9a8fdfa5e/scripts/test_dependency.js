
console.log('Testing @google-cloud/logging...');
try {
    import('@google-cloud/logging').then(() => console.log('SUCCESS: @google-cloud/logging')).catch(e => console.error('FAIL: @google-cloud/logging', e.message));
} catch (e) { console.error(e); }

console.log('Testing winston-elasticsearch...');
try {
    import('winston-elasticsearch').then(() => console.log('SUCCESS: winston-elasticsearch')).catch(e => console.error('FAIL: winston-elasticsearch', e.message));
} catch (e) { console.error(e); }

console.log('Testing winston-daily-rotate-file...');
try {
    import('winston-daily-rotate-file').then(() => console.log('SUCCESS: winston-daily-rotate-file')).catch(e => console.error('FAIL: winston-daily-rotate-file', e.message));
} catch (e) { console.error(e); }
