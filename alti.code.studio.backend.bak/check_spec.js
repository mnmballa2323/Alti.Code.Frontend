
import { specTool } from './src/app/modules/mcp/tools/spec.tool.js';
import fs from 'fs/promises';

async function checkSpec() {
    console.log('🏗️ Checking Spec Agent...');

    try {
        const result = await specTool.handler({ request: 'Add PayPal integration' });
        console.log('📄 Generated Spec (Excerpt):', result.content[0].text.substring(0, 100) + '...');

        // Verify File Creation
        const stats = await fs.stat('specification.md');
        if (stats.size > 0) {
            console.log('✅ specification.md created successfully.');
            // Cleanup
            await fs.unlink('specification.md');
        } else {
            console.error('❌ specification.md is empty.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Check Failed:', error);
        process.exit(1);
    }
}

checkSpec();
