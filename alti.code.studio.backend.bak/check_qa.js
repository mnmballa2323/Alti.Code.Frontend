
import fs from 'fs/promises';
import path from 'path';
import { qaService } from './src/app/modules/qa/qa.service.js';
import { logger } from './src/shared/logger.js';

async function checkQA() {
    console.log('🧪 Starting QA Architect Verification...');

    const dummyDir = './src/app/modules/qa';
    const dummyFile = path.join(dummyDir, 'dummy.math.js');
    const testFile = path.join(dummyDir, 'dummy.math.test.js');

    // 1. Create Dummy File
    const dummyCode = `
    export const add = (a, b) => a + b;
    export const subtract = (a, b) => a - b;
    `;
    await fs.writeFile(dummyFile, dummyCode);
    console.log(`📝 Created dummy source: ${dummyFile}`);

    try {
        // 2. Generate Tests
        console.log('🤖 Invoking QAService...');
        const result = await qaService.generateSpec(path.resolve(dummyFile));

        if (result.success) {
            console.log('✅ QA Generation Successful');
            console.log('Generated Content Length:', result.content.length);

            // 3. Verify File Creation
            try {
                await fs.access(testFile);
                console.log(`✅ Test file created at: ${testFile}`);
            } catch {
                console.error(`❌ Test file NOT found at: ${testFile}`);
                process.exit(1);
            }

        } else {
            console.error('❌ QA Generation Failed:', result.error);
            process.exit(1);
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    } finally {
        // Cleanup
        try {
            await fs.unlink(dummyFile);
            await fs.unlink(testFile);
            console.log('🧹 Cleanup complete');
        } catch (e) {
            // ignore cleanup errors
        }
    }
}

checkQA();
