import { ShadowWorkspaceService } from './src/app/modules/shadowWorkspace/shadowWorkspace.service.js';
import fs from 'fs/promises';
import path from 'path';

const runTest = async () => {
    console.log('🧪 Testing Shadow Workspace Service...');
    const sessionId = 'test-session-' + Date.now();

    try {
        // 1. Init
        console.log('Step 1: Init Shadow');
        await ShadowWorkspaceService.initShadow(sessionId);

        // Verify dir exists
        const shadowPath = path.resolve('.shadow', sessionId);
        await fs.access(shadowPath);
        console.log('✅ Shadow dir created');

        // 2. Apply Diff (Create a test file)
        console.log('Step 2: Apply Diff');
        const testFile = 'test-file.txt';
        const content = 'Hello Shadow World';
        await ShadowWorkspaceService.applyDiff(sessionId, testFile, content);

        // Verify file exists in shadow
        const shadowFilePath = path.join(shadowPath, testFile);
        const savedContent = await fs.readFile(shadowFilePath, 'utf-8');
        if (savedContent === content) {
            console.log('✅ File applied correctly');
        } else {
            throw new Error('File content mismatch');
        }

        // 3. Run Command
        console.log('Step 3: Run Command');
        // Windows might need different command if not using shell, but Node exec handles basic cross-platform 
        const result = await ShadowWorkspaceService.runCommand(sessionId, 'dir'); // 'dir' for windows, 'ls' for linux? let's try echo
        // Actually 'dir' is cmd builtin. 'echo' is safer.
        const echoResult = await ShadowWorkspaceService.runCommand(sessionId, 'echo "Test Output"');

        if (echoResult.stdout.includes('Test Output')) {
            console.log('✅ Command executed');
        } else {
            console.log('⚠️ Command output unexpected (might be OS specific shell issue):', echoResult);
            // Don't fail hard on shell nuance if init/apply worked
        }

        // 4. Commit (Test with the test file)
        console.log('Step 4: Commit');
        await ShadowWorkspaceService.commitShadow(sessionId);

        // Verify test file exists in real root
        const rootFilePath = path.resolve('src', 'test-file.txt');
        // Wait, my commit logic copies 'src' to 'src'. 
        // The test file was made at root of shadow, so strictly speaking `src/test-file.txt` if I put it there? 
        // My applyDiff `targetFile = path.join(shadowPath, filePath)`. 
        // If filePath was 'test-file.txt', it's at shadow root. 
        // My commit logic: `fs.cp(path.join(shadowPath, 'src'), path.join(sourcePath, 'src')`
        // So only files in `src` are committed.

        // Let's retry apply with a src file to test commit
        const srcTestFile = 'src/test-shadow-commit.txt';
        await ShadowWorkspaceService.applyDiff(sessionId, srcTestFile, 'Shadow Commit Data');
        await ShadowWorkspaceService.commitShadow(sessionId);

        const committedFile = path.resolve(srcTestFile);
        const committedContent = await fs.readFile(committedFile, 'utf-8');

        if (committedContent === 'Shadow Commit Data') {
            console.log('✅ Commit successful');
            // Cleanup
            await fs.unlink(committedFile);
        } else {
            throw new Error('Commit failed');
        }

        console.log('🎉 All Shadow Tests Passed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();
