
import fs from 'fs/promises';
import { loopTool } from './src/app/modules/mcp/tools/loop.tool.js';

async function checkLoop() {
    console.log('🔄 Checking Autonomic Loop...');

    // 1. Create a broken file
    const brokenFile = 'broken.test.js';
    // This script intentionally throws an error
    await fs.writeFile(brokenFile, `
    console.log('Running test...');
    throw new Error('Test Failed: Value should be 10 but was 5');
    `);

    try {
        // 2. Trigger the loop
        console.log('▶️ Calling auto_fix_loop...');
        const result = await loopTool.handler({
            command: `node ${brokenFile}`,
            maxRetries: 2
        });

        // 3. Analyze Results
        console.log('📊 Result Type:', result.isError ? 'Failure' : 'Success');
        if (result.content && result.content[0]) {
            console.log('📝 Output Snippet:', result.content[0].text.substring(0, 300));
        }

        // 4. Check if file was actually fixed?
        // Note: In a real run with Vertex AI, it should fix it. 
        // With Mock, it might not unless we mock the specific response.
        // For now, we mainly check that the Loop logic ran without crashing.

    } catch (error) {
        console.error('❌ Check Failed:', error);
    } finally {
        // Cleanup
        try { await fs.unlink(brokenFile); } catch { }
    }
}

checkLoop();
