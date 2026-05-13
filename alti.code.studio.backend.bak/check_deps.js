
import { depTool } from './src/app/modules/mcp/tools/dep.tool.js';

async function checkDeps() {
    console.log('📡 Checking Dependency Radar...');

    try {
        const result = await depTool.handler({});
        console.log('📊 Report:', result.content[0].text.substring(0, 200) + '...');
        console.log('✅ Dependency Radar Verified.');
    } catch (error) {
        console.error('❌ Check Failed:', error);
        process.exit(1);
    }
}

checkDeps();
