
import { specKitTool } from './src/app/modules/mcp/tools/speckit.tool.js';
import fs from 'fs/promises';
import path from 'path';

async function checkSpecKit() {
    console.log('📘 Checking SpecKit Integration...');

    try {
        // Run Tool
        const result = await specKitTool.handler({ request: 'Implement a Rate Limiter' });
        console.log('✨ Output:', result.content[0].text);

        // Verify Constitution
        const rootDir = path.join(process.cwd(), '.speckit');
        await fs.access(path.join(rootDir, 'constitution.md'));
        console.log('✅ Constitution found.');

        // Verify Spec File
        const files = await fs.readdir(path.join(rootDir, 'specs'));
        if (files.length > 0) {
            console.log(`✅ Spec file created: ${files[0]}`);

            // Clean up test spec (optional, maybe keep it?)
            // await fs.unlink(path.join(rootDir, 'specs', files[0]));
        } else {
            console.error('❌ No spec file created.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Check Failed:', error);
        process.exit(1);
    }
}

checkSpecKit();
