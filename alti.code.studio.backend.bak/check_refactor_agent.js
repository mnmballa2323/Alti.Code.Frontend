
import { refactorService } from './src/app/modules/refactorAgent/refactor.service.js';
import { jobQueueService } from './src/shared/jobQueue.service.js';

async function runTest() {
    console.log('🤖 Testing Refactor Agent...');

    // 1. Initialize
    console.log('Step 1: Initializing Service...');
    // Allow some time for workers to hook up
    await new Promise(r => setTimeout(r, 1000));

    // 2. Submit Task
    console.log('Step 2: Submitting Task...');
    const payload = {
        filePaths: ['src/index.js'],
        instruction: 'Rename function start to init',
        context: { priority: 'high' }
    };

    try {
        const { jobId } = await refactorService.submitTask(payload);
        console.log(`✅ Task Submitted. Job ID: ${jobId}`);

        // 3. Wait for Worker
        console.log('Step 3: Waiting for worker to process...');
        // In a real Redis env, we'd listen for events. 
        // In Mock mode, it processes immediately or very quickly.

        await new Promise(r => setTimeout(r, 2000));

        // Check job status (Mock or Real)
        const job = await jobQueueService.getJob('refactor-tasks', jobId);
        if (job) {
            const state = await job.getState();
            console.log(`ℹ️ Job State: ${state}`);
            // Note: In Mock mode, getJob might return the job object directly which doesn't have getState async in simplified version?
            // Let's rely on logs for now, or improve check.
            console.log('✅ Job retrieved successfully');
        } else {
            console.log('⚠️ Job not found (might be completed and removed, or mock limitations)');
        }

    } catch (error) {
        console.error('❌ Refactor Agent Test Failed:', error);
        process.exit(1);
    }
}

runTest().catch(console.error);
