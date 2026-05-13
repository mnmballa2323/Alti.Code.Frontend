import { DebugAgentService } from './src/app/modules/debugAgent/debugAgent.service.js';

const runTest = async () => {
    console.log('🧪 Testing Debug Agent Service...');
    try {
        const errorLog = 'ReferenceError: x is not defined';
        const stackTrace = 'at Object.<anonymous> (file.js:1:1)';
        const result = await DebugAgentService.analyzeError(errorLog, stackTrace);

        console.log('✅ Result:', JSON.stringify(result, null, 2));

        if (result.analysis.includes('ReferenceError')) {
            console.log('✅ Test Passed: Dummy analysis returned');
            process.exit(0);
        } else {
            console.error('❌ Test Failed: Analysis mismatch');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Test Failed with error:', error);
        process.exit(1);
    }
};

runTest();
