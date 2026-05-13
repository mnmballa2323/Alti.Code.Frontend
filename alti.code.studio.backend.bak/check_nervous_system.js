
import fs from 'fs/promises';
import path from 'path';
import { SentinelService } from './src/app/modules/sentinel/sentinel.service.js';
import { Surgeon } from './src/app/modules/surgeon/surgeon.service.js';
import { ShadowWorkspaceService } from './src/app/modules/shadowWorkspace/shadowWorkspace.service.js';
import { logger } from './src/shared/logger.js';

async function verifyNervousSystem() {
    logger.info('🧠 Verifying Nervous System (Sentinel -> Vertex -> Surgeon)...');

    const testFile = path.resolve('broken_file.js');

    try {
        // 1. Create a broken file
        await fs.writeFile(testFile, `
function recursiveFunction(n) {
    return n + recursiveFunction(n - 1); // No base case!
}
        `);
        logger.info('📄 Created broken_file.js');

        // 2. Trigger Sentinel with a simulated error
        // Note: We need to point Sentinel to the absolute path of this file so Surgeon can find it.
        // The Mock Vertex Service is hardcoded to return "broken_file.js", ensuring it matches.

        await SentinelService.handleSystemError({
            message: 'RangeError: Maximum call stack size exceeded',
            stack: `at recursiveFunction (${testFile}:2:5)`
        });

        // 3. Verify Surgeon fixed it
        // Give it a moment as Surgeon is async but awaited in handleSystemError? 
        // handleSystemError awaits Surgeon.operate, so it should be done.

        const content = await fs.readFile(testFile, 'utf-8');
        console.log('📄 Content after Surgeon:', content);

        if (content.includes('Base case added') || content.includes('[MOCK FIX')) {
            logger.info('✅ Surgeon successfully fixed the file!');
        } else {
            logger.error('❌ Surgeon failed to fix the file.');
            process.exit(1);
        }

        // 4. Verify Shadow Workspace
        logger.info('👻 Verifying Shadow Workspace...');
        const session = 'test-session-' + Date.now();
        await ShadowWorkspaceService.initShadow(session);
        const result = await ShadowWorkspaceService.runCommand(session, 'echo "Hello Shadow"');

        if (result.stdout.includes('Hello Shadow')) {
            logger.info('✅ Shadow Workspace executed command successfully.');
        } else {
            logger.error('❌ Shadow Workspace failed.', result);
            process.exit(1);
        }

        logger.info('🎉 Nervous System Fully Operational!');

    } catch (error) {
        logger.error('❌ Verification Failed', error);
        process.exit(1);
    } finally {
        // Cleanup
        try {
            await fs.unlink(testFile);
        } catch { }
    }
}

verifyNervousSystem();
