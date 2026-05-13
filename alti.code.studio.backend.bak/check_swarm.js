
import { swarmTool } from './src/app/modules/mcp/tools/swarm.tool.js';
import fs from 'fs/promises';
import { logger } from './src/shared/logger.js';

// Mock logger to keep output clean(er) for verification
logger.info = (msg) => console.log(`[INFO] ${msg}`);
logger.warn = (msg) => console.log(`[WARN] ${msg}`);
logger.error = (msg) => console.log(`[ERROR] ${msg}`);

async function checkSwarm() {
    console.log('🐝 Checking Swarm Intelligence...');
    const testFile = 'swarm_test.js';

    // Cleanup previous run
    try { await fs.unlink(testFile); } catch { }

    try {
        const goal = `Create a file named ${testFile} that logs 'Swarm is working', then verify it by running it with node.`;
        console.log(`🎯 Goal: "${goal}"`);

        const result = await swarmTool.handler({ goal });

        console.log('📊 Result Type:', result.isError ? 'Failure' : 'Success');
        if (result.content && result.content[0]) {
            console.log('📝 Output Snippet:', result.content[0].text.substring(0, 300));
        }

        // Verification
        try {
            const content = await fs.readFile(testFile, 'utf-8');
            console.log('✅ File created successfully.');
            if (content.includes('Swarm is working')) {
                console.log('✅ File content matches content verification.');
            } else {
                console.log('⚠️ File content verification failed.');
            }
        } catch (e) {
            console.log('❌ File was NOT created.');
        }

    } catch (error) {
        console.error('❌ Check Failed:', error);
    } finally {
        // Cleanup 
        try { await fs.unlink(testFile); } catch { }
    }
}

checkSwarm();
