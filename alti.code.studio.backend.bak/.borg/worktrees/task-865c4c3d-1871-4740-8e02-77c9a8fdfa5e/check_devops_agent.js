import { DevOpsAgentService } from './src/app/modules/devOpsAgent/devOpsAgent.service.js';

const runTest = async () => {
    console.log('🧪 Testing DevOps Agent Service...');
    try {
        const awsResult = await DevOpsAgentService.deployToCloud('AWS', { region: 'us-west-1' });
        const azureResult = await DevOpsAgentService.deployToCloud('Azure', { region: 'westeurope' });
        const gcpResult = await DevOpsAgentService.deployToCloud('GCP', {});

        console.log('✅ AWS Result:', JSON.stringify(awsResult, null, 2));

        if (awsResult.status === 'deployed' && azureResult.provider === 'Azure' && gcpResult.details.service === 'Cloud Run') {
            console.log('✅ Test Passed: All cloud stubs working');
            process.exit(0);
        } else {
            console.error('❌ Test Failed: Invalid response structure');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Test Failed with error:', error);
        process.exit(1);
    }
};

runTest();
