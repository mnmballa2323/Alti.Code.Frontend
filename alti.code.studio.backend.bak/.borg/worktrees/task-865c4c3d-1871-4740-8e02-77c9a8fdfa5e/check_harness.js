import { HarnessService } from './src/app/modules/harness/harness.service.js';

const runTest = async () => {
    console.log('🧪 Testing Harness CI/CD Service...');

    try {
        // 1. Execute Pipeline
        console.log('Step 1: Execute Pipeline');
        const pipelineId = 'pl_deploy_prod';
        const result = await HarnessService.executePipeline(pipelineId, { service: 'api', tag: 'v2.0.0' });

        if (result.status === 'Running' && result.pipelineIdentifier === pipelineId) {
            console.log('✅ Pipeline triggered:', result.executionId);
        } else {
            throw new Error('Pipeline trigger response invalid');
        }

        // 2. Check Status
        console.log('Step 2: Check Status');
        const statusResult = await HarnessService.getExecutionStatus(result.executionId);

        if (statusResult.executionId === result.executionId && statusResult.status) {
            console.log(`✅ Status retrieved: ${statusResult.status}`);
        } else {
            throw new Error('Status retrieval invalid');
        }

        console.log('🎉 Harness Test Passed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();
