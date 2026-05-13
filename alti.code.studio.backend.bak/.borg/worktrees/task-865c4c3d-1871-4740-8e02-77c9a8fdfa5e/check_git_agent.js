import { GitAgentService } from './src/app/modules/gitAgent/gitAgent.service.js';
import path from 'path';

const runTest = async () => {
    console.log('🧪 Testing Git Agent Service...');

    try {
        // 1. Start Watcher
        console.log('Step 1: Start Watcher');
        const startResult = await GitAgentService.startWatcher(process.cwd());
        console.log('Watcher started:', startResult);

        // 2. Check Status
        console.log('Step 2: Check Status');
        const status = await GitAgentService.getStatus();
        if (status.isWatching) {
            console.log('✅ Status: Watching');
        } else {
            throw new Error('Watcher failed to start');
        }

        // 3. Stop Watcher
        console.log('Step 3: Stop Watcher');
        await GitAgentService.stopWatcher();
        const stopStatus = await GitAgentService.getStatus();
        if (!stopStatus.isWatching) {
            console.log('✅ Status: Stopped');
        } else {
            throw new Error('Watcher failed to stop');
        }

        console.log('🎉 Git Agent Test Passed (Logic Only - Git ops skipped for safety)');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();
