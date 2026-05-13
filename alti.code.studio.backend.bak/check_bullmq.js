
import { jobQueueService } from './src/shared/jobQueue.service.js';
import { logger } from './src/shared/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const QUEUE_NAME = 'verification-queue';

async function runTest() {
    console.log('🐂 Testing BullMQ Job Queue Service...');

    // 0. Ensure Service is Ready (Checks Redis vs Mock)
    await jobQueueService.ensureReady();
    console.log(`ℹ️ Mode: ${jobQueueService.isMockMode ? 'MOCK' : 'REDIS'}`);

    // 1. Register Worker
    console.log('Step 1: Registering Worker...');
    let resolveJob;
    const jobPromise = new Promise(resolve => resolveJob = resolve);

    jobQueueService.registerWorker(QUEUE_NAME, async (job) => {
        console.log(`👷 Worker received job: ${job.name} with data:`, job.data);
        return job.data.value * 2;
    });

    // 2. Add Job
    console.log('Step 2: Adding Job...');
    const job = await jobQueueService.addJob(QUEUE_NAME, 'multiply', { value: 21 });
    console.log(`📨 Job added with ID: ${job.id}`);

    // 3. Wait for validation result
    // Since workers are separate processes typically, here we just wait for the promise from job.finished()
    console.log('Step 3: Waiting for completion...');
    try {
        const result = await job.waitUntilFinished(jobQueueService.queues.get(QUEUE_NAME), 5000); // 5s timeout
        console.log('✅ Job Finished. Result:', result);

        if (result === 42) {
            console.log('🎉 BullMQ Verification Passed');
        } else {
            console.error('❌ Result mismatch');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Job Failed or Timed Out:', error);
        process.exit(1);
    } finally {
        await jobQueueService.close();
        console.log('🛑 Service closed');
        process.exit(0);
    }
}

runTest().catch(console.error);
