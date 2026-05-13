import { GeneratorService } from './src/app/modules/generator/generator.service.js';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './src/shared/logger.js';

const runTest = async () => {
    console.log('🧪 Testing Text-to-App Generator...');

    const prompt = 'Create a simple landing page';
    const targetDir = path.resolve('generated', 'test-app-' + Date.now());

    try {
        // 1. Generate (Mock/Fallback or Real)
        console.log('Step 1: Generate App JSON');
        const fileTree = await GeneratorService.generateApp(prompt);

        if (!fileTree || !fileTree.files || fileTree.files.length === 0) {
            throw new Error('Generation returned empty results');
        }
        console.log('✅ Generated file tree with', fileTree.files.length, 'files');

        // 2. Write to disk
        console.log('Step 2: Write to Disk');
        const result = await GeneratorService.writeApp(fileTree, targetDir);

        // Verify files exist
        const indexFile = fileTree.files.find(f => f.path === 'index.html');
        if (indexFile) {
            const filePath = path.join(targetDir, indexFile.path);
            await fs.access(filePath);
            console.log('✅ Verified index.html existence');
        } else {
            console.warn('⚠️ index.html not found in generation result, but write completed');
        }

        console.log('🎉 Generator Test Passed');
        // Cleanup
        // await fs.rm(targetDir, { recursive: true, force: true });
        process.exit(0);

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();
