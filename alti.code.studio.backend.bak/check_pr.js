
import { prTool } from './src/app/modules/mcp/tools/pr.tool.js';

async function checkPR() {
    console.log('✍️ Checking PR Writer...');

    try {
        const result = await prTool.handler({});
        console.log('📝 Result:', result.content[0].text);

        if (result.content[0].text) {
            console.log('✅ PR Writer Verified.');
        }

    } catch (error) {
        console.error('❌ Check Failed:', error);
        process.exit(1);
    }
}

checkPR();
