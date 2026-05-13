
import fs from 'fs/promises';
import { schemaTool } from './src/app/modules/mcp/tools/schema.tool.js';
import path from 'path';

async function checkSchema() {
    console.log('💾 Checking Schema Agent...');

    try {
        const result = await schemaTool.handler({
            description: 'Create a Products table with id, name, and price'
        });

        console.log('📊 Result Type:', result.isError ? 'Error' : 'Success');
        if (result.content && result.content[0]) {
            console.log('📝 Output Snippet:', result.content[0].text.substring(0, 300));

            // Extract filename from output to verify existence
            const match = result.content[0].text.match(/Migration File: (.+\.sql)/);
            if (match) {
                const filename = match[1];
                console.log(`✅ Migration file reported: ${filename}`);
                // Verify file existence (agent creates it in migrations dir relative to CWD)
                // The filename in output might be just basename or relative path depending on agent logic.
                // Our agent implementation logs the basename.
                const fullPath = path.join(process.cwd(), 'migrations', filename);
                try {
                    await fs.access(fullPath);
                    console.log('✅ Migration file actually exists on disk.');
                } catch {
                    console.log('❌ Could not find migration file on disk.');
                }
            }
        }
    } catch (error) {
        console.error('❌ Check Failed:', error);
    }
}

checkSchema();
