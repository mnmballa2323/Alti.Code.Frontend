
import { dockerService } from './src/shared/docker.service.js';

async function runTest() {
    console.log('🐳 Testing Entire.io CLI (via DockerService)...');

    // 1. Initialize
    console.log('Step 1: Initializing Service...');
    await dockerService.ensureReady();
    console.log(`ℹ️ Mode: ${dockerService.isMockMode ? 'MOCK' : 'REAL'}`);

    // 2. Run Command
    console.log('Step 2: Running "entire --version"...');
    try {
        const output = await dockerService.runEntireCommand(['--version']);
        console.log('Output:', output);

        if (output.includes('entire version') || output.includes('mock')) {
            console.log('✅ CLI verification Passed');
        } else {
            console.error('❌ Unexpected output:', output);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Failed to run CLI command:', error);
        process.exit(1);
    }
}

runTest().catch(console.error);
