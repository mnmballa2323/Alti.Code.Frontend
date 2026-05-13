
import { composerTool } from './src/app/modules/mcp/tools/composer.tool.js';
import fs from 'fs/promises';

async function checkComposer() {
    console.log('🎹 Starting Composer Verification...');

    try {
        console.log('🎵 Requesting Composition...');
        const result = await composerTool.handler({ request: 'Create a test file' });
        console.log('📜 Output:', result.content[0].text);

        // Check if file was created (Mock behavior: temp_composer_test.txt)
        const fileExists = await fs.stat('temp_composer_test.txt').then(() => true).catch(() => false);

        if (fileExists) {
            console.log('✅ File created successfully.');
            // Cleanup
            await fs.unlink('temp_composer_test.txt');
        } else {
            console.error('❌ Expected file temp_composer_test.txt not found.');
            process.exit(1);
        }

        console.log('✅ Composer Verification Successful');

    } catch (error) {
        console.error('❌ Composer Failed:', error);
        process.exit(1);
    }
}

checkComposer();
