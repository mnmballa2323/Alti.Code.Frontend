import { SecurityAgentService } from './src/app/modules/securityAgent/securityAgent.service.js';
import { logger } from './src/shared/logger.js';

const runTest = async () => {
    console.log('🧪 Testing Security Agent Service...');
    try {
        const report = await SecurityAgentService.auditCodebase('./src');
        console.log('✅ Security Audit Report:', JSON.stringify(report, null, 2));

        if (report.score === 100) {
            console.log('✅ Test Passed: Perfect Score returned (dummy logic working)');
            process.exit(0);
        } else {
            console.error('❌ Test Failed: Unexpected score');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Test Failed with error:', error);
        process.exit(1);
    }
};

runTest();
